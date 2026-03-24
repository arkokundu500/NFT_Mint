#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

fn setup_test() -> (Env, StellarNFTClient<'static>, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, StellarNFT);
    let client = StellarNFTClient::new(&env, &contract_id);
    let user = Address::generate(&env);
    (env, client, user)
}

#[test]
fn test_mint_single() {
    let (_env, client, user) = setup_test();
    let nft_id = client.mint(&user);
    assert_eq!(nft_id, 0);
    assert_eq!(client.owner_of(&0), user);
    assert_eq!(client.total_supply(), 1);
}

#[test]
fn test_mint_multiple_same_owner() {
    let (_env, client, user) = setup_test();
    assert_eq!(client.mint(&user), 0);
    assert_eq!(client.mint(&user), 1);
    assert_eq!(client.mint(&user), 2);
    
    let nfts = client.get_nfts_of(&user);
    assert_eq!(nfts.len(), 3);
    assert_eq!(nfts.get(0).unwrap().id, 0);
    assert_eq!(nfts.get(1).unwrap().id, 1);
    assert_eq!(nfts.get(2).unwrap().id, 2);
}

#[test]
fn test_mint_multiple_different_owners() {
    let (env, client, user_a) = setup_test();
    let user_b = Address::generate(&env);

    client.mint(&user_a);
    client.mint(&user_b);

    let nfts_a = client.get_nfts_of(&user_a);
    let nfts_b = client.get_nfts_of(&user_b);

    assert_eq!(nfts_a.len(), 1);
    assert_eq!(nfts_a.get(0).unwrap().id, 0);
    
    assert_eq!(nfts_b.len(), 1);
    assert_eq!(nfts_b.get(0).unwrap().id, 1);
}

#[test]
fn test_owner_of() {
    let (_env, client, user) = setup_test();
    let nft_id = client.mint(&user);
    assert_eq!(client.owner_of(&nft_id), user);
}

#[test]
fn test_total_supply_increments() {
    let (_env, client, user) = setup_test();
    for _ in 0..5 {
        client.mint(&user);
    }
    assert_eq!(client.total_supply(), 5);
}

#[test]
fn test_get_nfts_of_empty() {
    let (_env, client, user) = setup_test();
    let nfts = client.get_nfts_of(&user);
    assert_eq!(nfts.len(), 0);
}
