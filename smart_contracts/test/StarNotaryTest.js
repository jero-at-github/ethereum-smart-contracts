const StarNotary = artifacts.require('StarNotary')

contract('StarNotary', accounts => { 

    let starTestData = [
        "Star power 103!", 
        "I love my wonderful star", 
        "ra_032.155", 
        "dec_121.874", 
        "mag_245.978"
    ];

    beforeEach(async function() { 
        this.contract = await StarNotary.new({from: accounts[0]})
    })
    
    describe('can create a star and check existence', () => { 

        let starId = 1;

        beforeEach(async function () { 

            // create the star
            await this.contract.createStar(starTestData[0], starTestData[1], starTestData[2], starTestData[3], starTestData[4], starId, {from: accounts[0]});                   
        })

        it('can create a star and get its name', async function () {                         
            
            // check if the star was correctly created
            let createdStar = await this.contract.tokenIdToStarInfo(starId);

            assert.equal(
                JSON.stringify(createdStar), 
                JSON.stringify(starTestData),
                "The created star doesn't contain the expected properties values"
            );                             
        })

        it('Check that it exists', async function () {   

            // check if the checkIfStarExist function works as expected
            let isStarAlreadyRegistered = await this.contract.checkIfStarExist(starTestData[2], starTestData[3], starTestData[4]);
            assert.equal(isStarAlreadyRegistered, true, "The isStarAlreadyRegistered function failed");            
        })
    })

    describe('buying and selling stars', () => { 

        let user1 = accounts[1]
        let user2 = accounts[2]
        let randomMaliciousUser = accounts[3]
        
        let starId = 1
        let starPrice = web3.toWei(.01, "ether")

        beforeEach(async function () { 
            await this.contract.createStar(starTestData[0], starTestData[1], starTestData[2], starTestData[3], starTestData[4], starId, {from: user1});             
        })

        it('user1 can put up their star for sale', async function () { 

            let ownerOfStar = await this.contract.ownerOf(starId);
            assert.equal(ownerOfStar, user1)
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

    describe("safe transfer + ownerOf", () => {

        let user1 = accounts[1];
        let user2 = accounts[2];
        let starId = 1;

        beforeEach(async function () { 

            // create the star
            await this.contract.createStar(starTestData[0], starTestData[1], starTestData[2], starTestData[3], starTestData[4], starId, {from: user1});                   
        })

        it("user1 can transfer a star to user 2", async function() {
           
            await this.contract.safeStarTransferFrom(user1, user2, starId, {from: user1});    
            let newOwner = await this.contract.ownerOfStar(starId);                   
            assert.equal(newOwner, user2, "The ownership change failed!");
        });
    });

    describe("different approvoval related tests", () => {

        let user1 = accounts[1];
        let user2 = accounts[2];
        let starId = 1;

        beforeEach(async function () { 

            // create the star
            await this.contract.createStar(starTestData[0], starTestData[1], starTestData[2], starTestData[3], starTestData[4], starId, {from: user1});                   
        })

        it("user1 can approve user2", async function() {
           
            await this.contract.approveStar(user2, starId, {from: user1});    
            let approvedAccount = await this.contract.getStarApproved(starId, {from: user1});    
            assert.equal(approvedAccount, user2, "The approval operation failed!");

            // set to false the status for approval
            await this.contract.setStarApprovalForAll(user2, false, {from: user1});                          
            let isApproved = await this.contract.isStarApprovedForAll(user1, user2);                  
            assert.equal(isApproved, false, "The approval status is wrong!");                
        });
    });

})