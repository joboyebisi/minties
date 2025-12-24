import { GiftCreated, GiftClaimed, GiftCancelled, GiftExpired } from "../generated/GiftEscrow/GiftEscrow";
import { Gift, GiftClaim } from "../generated/schema";

/**
 * Handle GiftCreated event
 */
export function handleGiftCreated(event: GiftCreated): void {
  const giftId = event.params.giftId.toHexString();
  
  let gift = new Gift(giftId);
  gift.id = giftId;
  gift.creator = event.params.creator.toHexString();
  gift.amount = event.params.amount;
  gift.remainingAmount = event.params.amount; // Initially, all amount is remaining
  gift.giftType = event.params.giftType.toString();
  gift.maxClaims = 0; // Will be set based on gift type
  gift.currentClaims = 0;
  gift.expiryTime = event.params.expiryTime;
  gift.isActive = true;
  gift.createdAt = event.block.timestamp;
  
  gift.save();
}

/**
 * Handle GiftClaimed event
 */
export function handleGiftClaimed(event: GiftClaimed): void {
  const giftId = event.params.giftId.toHexString();
  const claimId = `${giftId}-${event.params.claimer.toHexString()}-${event.block.timestamp}`;
  
  // Update gift
  let gift = Gift.load(giftId);
  if (gift) {
    gift.remainingAmount = gift.remainingAmount - event.params.amount;
    gift.currentClaims = gift.currentClaims + 1;
    
    // If no remaining amount, mark as inactive
    if (gift.remainingAmount <= 0) {
      gift.isActive = false;
    }
    
    gift.save();
  }
  
  // Create claim record
  let claim = new GiftClaim(claimId);
  claim.id = claimId;
  claim.giftId = giftId;
  claim.claimer = event.params.claimer.toHexString();
  claim.amount = event.params.amount;
  claim.timestamp = event.block.timestamp;
  claim.txHash = event.transaction.hash.toHexString();
  
  claim.save();
}

/**
 * Handle GiftCancelled event
 */
export function handleGiftCancelled(event: GiftCancelled): void {
  const giftId = event.params.giftId.toHexString();
  
  let gift = Gift.load(giftId);
  if (gift) {
    gift.isActive = false;
    gift.remainingAmount = 0; // All refunded
    gift.save();
  }
}

/**
 * Handle GiftExpired event
 */
export function handleGiftExpired(event: GiftExpired): void {
  const giftId = event.params.giftId.toHexString();
  
  let gift = Gift.load(giftId);
  if (gift) {
    gift.isActive = false;
    gift.save();
  }
}

