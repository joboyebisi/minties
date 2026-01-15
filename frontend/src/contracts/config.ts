import RealEstateABI from "./RealEstate.json";
import AssetGroupFactoryABI from "./AssetGroupFactory.json";
import AssetGroupABI from "./AssetGroup.json";

export const CONTRACTS = {
    RealEstate: {
        address: "0x6c54439DE8243f3993D8286d51B53143119935Af" as `0x${string}`,
        abi: RealEstateABI.abi
    },
    AssetGroupFactory: {
        address: "0x7Af38C7df28796Ab68b01da9779339C9CEdcf1aF" as `0x${string}`,
        abi: AssetGroupFactoryABI.abi
    },
    AssetGroup: {
        abi: AssetGroupABI.abi
    }
};
