#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Vec};

#[contracttype]
pub enum DataKey {
    TotalSupply,
    Owner(u32),
    OwnedNFTs(Address),
}

#[contracttype]
#[derive(Clone)]
pub struct NFT {
    pub id: u32,
    pub owner: Address,
}

#[contract]
pub struct StellarNFT;

#[contractimpl]
impl StellarNFT {
    pub fn mint(env: Env, to: Address) -> u32 {
        to.require_auth();

        let total_supply_key = DataKey::TotalSupply;
        let id: u32 = env.storage().persistent().get(&total_supply_key).unwrap_or(0);

        // Map owner
        env.storage().persistent().set(&DataKey::Owner(id), &to);

        // Update OwnedNFTs
        let owned_nfts_key = DataKey::OwnedNFTs(to.clone());
        let mut owned_nfts: Vec<u32> = env
            .storage()
            .persistent()
            .get(&owned_nfts_key)
            .unwrap_or(Vec::new(&env));
        owned_nfts.push_back(id);
        env.storage().persistent().set(&owned_nfts_key, &owned_nfts);

        // Increment supply
        env.storage().persistent().set(&total_supply_key, &(id + 1));

        id
    }

    pub fn owner_of(env: Env, nft_id: u32) -> Address {
        env.storage()
            .persistent()
            .get(&DataKey::Owner(nft_id))
            .unwrap_or_else(|| panic!("NFT with id {} does not exist", nft_id))
    }

    pub fn get_nfts_of(env: Env, owner: Address) -> Vec<NFT> {
        let owned_nfts: Vec<u32> = env
            .storage()
            .persistent()
            .get(&DataKey::OwnedNFTs(owner.clone()))
            .unwrap_or(Vec::new(&env));

        let mut nfts = Vec::new(&env);
        for id in owned_nfts.into_iter() {
            nfts.push_back(NFT {
                id,
                owner: owner.clone(),
            });
        }
        nfts
    }

    pub fn total_supply(env: Env) -> u32 {
        env.storage().persistent().get(&DataKey::TotalSupply).unwrap_or(0)
    }
}

#[cfg(test)]
mod test;
