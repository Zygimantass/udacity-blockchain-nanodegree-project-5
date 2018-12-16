const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => {

    let user1 = accounts[0];
    let user2 = accounts[1];
    let user3 = accounts[2];
    let starPrice = web3.toWei(.01, "ether");
    let starId = 1;

    let starName = "Star power 103!";
    let starStory = "I love my wonderful star";
    let starRA = "ra_032.155";
    let starDEC = "dec_121.874";
    let starMAG = "mag_245.978";

    beforeEach(async function() {
        this.contract = await StarNotary.new({from: user1})
    })

    describe('can create a star', () => {
        it('can create a star and get its info', async function () {
            await this.contract.createStar(starName, starStory, starRA, starDEC, starMAG, {from: user1});
            starInfo = await this.contract.tokenIdToStarInfo(starId);
		        assert.deepEqual(starInfo, [starName, starStory, starRA, starDEC, starMAG]);
        })
    })

    describe('buying and selling stars', () => {
        let user1 = accounts[1]
        let user2 = accounts[2]
        let randomMaliciousUser = accounts[3]

        let starId = 1
        let starPrice = web3.toWei(.01, "ether")

        beforeEach(async function () {
            await this.contract.createStar(starName, starStory, starRA, starDEC, starMAG, {from: user1});
        })

        it('user1 can put up their star for sale', async function () {
            assert.equal(await this.contract.ownerOf(starId), user1)
            await this.contract.putStarUpForSale(starId, starPrice, {from: user1})

            assert.equal(await this.contract.starsForSale(starId), starPrice)
        })

        describe('user2 can buy a star that was put up for sale', () => {
            beforeEach(async function () {
                await this.contract.putStarUpForSale(starId, starPrice, {from: user1})
            })

            it('user2 is the owner of the star after they buy it', async function() {
                await this.contract.buyStar(starId, {from: user2, value: starPrice, gasPrice: 0})
                assert.equal(await this.contract.ownerOf(starId), user2)
            })

            it('user2 ether balance changed correctly', async function () {
                let overpaidAmount = web3.toWei(.05, 'ether')
                const balanceBeforeTransaction = web3.eth.getBalance(user2)
                await this.contract.buyStar(starId, {from: user2, value: overpaidAmount, gasPrice: 0})
                const balanceAfterTransaction = web3.eth.getBalance(user2)

                assert.equal(balanceBeforeTransaction.sub(balanceAfterTransaction), starPrice)
            })
        })
    })

    describe("checking for star existance", () => {
        it('star already exists', async function () {
            await this.contract.createStar(starName, starStory, starRA, starDEC, starMAG, {from: user1});

            assert.equal(await this.contract.checkIfStarExist(starRA, starDEC, starMAG), true);
        })
    });

    describe('minting', () => {
        it('minted token is owned by our sender', async function () {
            await this.contract.mint(starId, {from: user1});
            let owner = await this.contract.ownerOf(starId, {from: user1});
            assert.equal(owner, user1);
        })
    })

    describe('approving', () => {
        it('gets approved', async function () {
            await this.contract.createStar(starName, starStory, starRA, starDEC, starMAG, {from: user1});
            await this.contract.approve(user2, starId, {from: user1});

            assert.equal(await this.contract.getApproved(starId, {from: user1}), user2);
        })
    })

    describe('approving for all', () => {
        it('is approved for all', async function () {
          await this.contract.createStar(starName, starStory, starRA, starDEC, starMAG, {from: user1});
          await this.contract.setApprovalForAll(user2, starId);

          assert.equal(await this.contract.isApprovedForAll(user1, user2, {from: user1}), true);
        })
    })

    describe('safe transfers', () => {
        it ('owns the token', async function () {
            await this.contract.createStar(starName, starStory, starRA, starDEC, starMAG, {from: user1});
            await this.contract.safeTransferFrom(user1, user2, starId);

            assert.equal(await this.contract.ownerOf(starId, {from: user1}), user2)
        });
    })
})
