import {
  CircleCreated,
  MemberJoined,
  ContributionMade,
  FundsLocked,
  FundsUnlocked,
  Withdrawal
} from "../generated/SavingsCircle/SavingsCircle";
import { SavingsCircle, Contribution } from "../generated/schema";

/**
 * Handle CircleCreated event
 */
export function handleCircleCreated(event: CircleCreated): void {
  const circleId = event.params.circleId.toHexString();
  
  let circle = new SavingsCircle(circleId);
  circle.id = circleId;
  circle.creator = event.params.creator.toHexString();
  circle.targetAmount = event.params.targetAmount;
  circle.lockPeriod = event.params.lockPeriod;
  circle.yieldPercentage = event.params.yieldPercentage;
  circle.totalContributed = 0;
  circle.lockedAmount = 0;
  circle.lockStartTime = 0;
  circle.lockEndTime = 0;
  circle.cycleNumber = 0;
  circle.isActive = true;
  circle.createdAt = event.block.timestamp;
  
  circle.save();
}

/**
 * Handle MemberJoined event
 */
export function handleMemberJoined(event: MemberJoined): void {
  const circleId = event.params.circleId.toHexString();
  
  let circle = SavingsCircle.load(circleId);
  if (circle) {
    // Circle entity is updated, but we track members separately in Supabase
    // This event is mainly for indexing/history
    circle.save();
  }
}

/**
 * Handle ContributionMade event
 */
export function handleContributionMade(event: ContributionMade): void {
  const circleId = event.params.circleId.toHexString();
  const contributionId = `${circleId}-${event.params.member.toHexString()}-${event.block.timestamp}`;
  
  // Update circle
  let circle = SavingsCircle.load(circleId);
  if (circle) {
    circle.totalContributed = circle.totalContributed + event.params.amount;
    circle.save();
  }
  
  // Create contribution record
  let contribution = new Contribution(contributionId);
  contribution.id = contributionId;
  contribution.circleId = circleId;
  contribution.member = event.params.member.toHexString();
  contribution.amount = event.params.amount;
  contribution.cycleNumber = event.params.cycleNumber;
  contribution.timestamp = event.block.timestamp;
  contribution.txHash = event.transaction.hash.toHexString();
  
  contribution.save();
}

/**
 * Handle FundsLocked event
 */
export function handleFundsLocked(event: FundsLocked): void {
  const circleId = event.params.circleId.toHexString();
  
  let circle = SavingsCircle.load(circleId);
  if (circle) {
    circle.lockedAmount = event.params.amount;
    circle.lockStartTime = event.block.timestamp;
    circle.lockEndTime = event.params.lockEndTime;
    circle.save();
  }
}

/**
 * Handle FundsUnlocked event
 */
export function handleFundsUnlocked(event: FundsUnlocked): void {
  const circleId = event.params.circleId.toHexString();
  
  let circle = SavingsCircle.load(circleId);
  if (circle) {
    circle.lockedAmount = 0;
    circle.lockStartTime = 0;
    circle.lockEndTime = 0;
    circle.cycleNumber = circle.cycleNumber + 1;
    circle.save();
  }
}

/**
 * Handle Withdrawal event
 */
export function handleWithdrawal(event: Withdrawal): void {
  const circleId = event.params.circleId.toHexString();
  
  let circle = SavingsCircle.load(circleId);
  if (circle) {
    // Update total contributed (subtract withdrawn amount)
    if (circle.totalContributed >= event.params.amount) {
      circle.totalContributed = circle.totalContributed - event.params.amount;
    }
    circle.save();
  }
}

