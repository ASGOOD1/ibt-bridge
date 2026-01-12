module ibt::ibt {
    use sui::coin::{Self, TreasuryCap};
    use sui::tx_context::{Self, TxContext};
    use std::option;
    use sui::transfer;

    /// The type identifier of coin. OTW (One Time Witness) pattern.
    public struct IBT has drop {}

    /// Module initializer
    fun init(witness: IBT, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness, 
            6, 
            b"IBT", 
            b"Initial Bridge Token", 
            b"Cross-chain bridge token", 
            option::none(), 
            ctx
        );
        transfer::public_freeze_object(metadata);
        // Transfer the TreasuryCap to the deployer so they can mint/burn
        transfer::public_transfer(treasury, ctx.sender());
    }

    /// Only the holder of the TreasuryCap can mint
    public entry fun mint(
        treasury_cap: &mut TreasuryCap<IBT>, 
        amount: u64, 
        recipient: address, 
        ctx: &mut TxContext
    ) {
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
    }

    /// Only the holder of the TreasuryCap can burn
    public entry fun burn(
        treasury_cap: &mut TreasuryCap<IBT>, 
        coin: coin::Coin<IBT>
    ) {
        coin::burn(treasury_cap, coin);
    }
}