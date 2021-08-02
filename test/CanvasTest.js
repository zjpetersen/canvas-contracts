const Canvas = artifacts.require("./Canvas.sol");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');

contract("Canvas", (accounts) => {
 let canvas;
 let sectionId = 15;
 let expectedOwner;
 let sectionId1 = 1;
 let sectionId2 = 2;
 let sectionId3 = 3;
 let sectionId4 = 4;
 let expectedOwner1;
 const SECTION_ID_NEG = -1;
 const SECTION_ID_INVALID = 7056;
 const PRICE_1 = "500000000000000000"; //.5 ether
 const PRICE_2 = "3000000000000000000"; //3 ether
 const PRICE_3 = "100000000000000000"; //.1 ether
 const PRICE_NEG = -3;

 before(async () => {
     canvas = await Canvas.deployed();
 });

 describe("test get owner", async () => {
   it("can get owner", async () => {
     const actualOwner = await canvas.getOwner(sectionId, {from :accounts[0]});

     assert.equal(actualOwner, '0x0000000000000000000000000000000000000000', "The owner of the free section should be empty");
   });

 });

 describe("test getting free sections", async () => {
  //  let expectedOwner;
   before("get a free section", async () => {
     await canvas.getSectionForFree(sectionId, { from: accounts[0] });
     expectedOwner = accounts[0];
     await canvas.getSectionForFree(sectionId1, { from: accounts[1] });
     expectedOwner1 = accounts[1];
   });

   it("can assign owner to free section properly", async () => {
     const actualOwner = await canvas.getOwner(sectionId);

     assert.equal(actualOwner, expectedOwner, "The owner of the free section should be first account");
   });

   it("can assign owner to free section properly 1", async () => {
     const actualOwner = await canvas.getOwner(sectionId1);

     assert.equal(actualOwner, expectedOwner1, "The owner of the free section should be second account");
   });

   it("cannot assign owner to already owned section", async () => {
     await truffleAssert.reverts(
       canvas.getSectionForFree(sectionId, { from: accounts[0] }));
   });

   it("cannot assign owner to already owned section", async () => {
     await truffleAssert.reverts(
       canvas.getSectionForFree(sectionId, { from: accounts[1] }));
   });

 });

 describe("test get section", async () => {
   it("can get owner", async () => {
     const section = await canvas.getSection(sectionId1, {from :accounts[0]});
     
     assert.equal(section.owner, accounts[1], "Can access properties correctly");
     assert.equal(section.hasOwner, true, "Can access properties correctly2");
     assert.equal(section.ask, 0, "Can access properties correctly2");
     assert.equal(section.updatedColor, false, "Can access properties correctly2");
   });

 });


 describe("test setting color bytes", async () => {
   let buffer = new ArrayBuffer();
   let expectedColor = new Int8Array(buffer);
  //  expectedColor = Int8Array.from([80,78,71,13,10,26,10,0,0,0,13,73]);
   expectedColor = Int8Array.from([-119, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 16, 0, 0, 0, 16, 8, 6, 0, 0, 0, 31, -13, -1, 97, 0, 0, 0, 1, 115, 82, 71, 66, 0, -82, -50, 28, -23, 0, 0, 0, -105, 73, 68, 65, 84, 56, -115, 99, -116, -50, 123, -8, -97, -127, -127, -127, -31, -8, -90, 96, 6, 116, 96, -23, -73, 22, -85, 56, 76, -114, -127, -127, -127, -127, 9, -97, -26, 39, 23, 39, -61, 21, -94, 3, -104, 30, 38, 92, 54, 16, 3]);
  //  let expectedColor = new Uint8Array(buffer);
  //  expectedColor = Uint8Array.from([80,78,71,13,10,26,10,0,0,0,13,73,245]);
   let hex = '0x';
   hex += Array.from(expectedColor, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');

  expectedColor = hex;
  // let hex = expectedColor;
   

   it("cannot set color for non-owner", async () => {
     await truffleAssert.reverts(
       canvas.setColorBytes(sectionId1, expectedColor, { from: accounts[0] }));
   });

   it("can set color for owner", async () => {
     let tx = await canvas.setColorBytes(sectionId1, expectedColor, {from: accounts[1]});
     truffleAssert.eventEmitted(tx, 'ColorBytesUpdated', (ev) => {
       return ev.updatedColor === hex;
     });
   });

   it("cannot set color a second time", async () => {
     await truffleAssert.reverts(
       canvas.setColorBytes(sectionId1, expectedColor, { from: accounts[1] })
     );
   });

 });


 describe("test asks", async () => {

   //Happy path
   it("can create an ask", async () => {
     await canvas.ask(sectionId, PRICE_1, {from: accounts[0]});
     let ask = await canvas.getAsk(sectionId);

     await canvas.ask(sectionId1,PRICE_1, {from: accounts[1]});
     let ask1 = await canvas.getAsk(sectionId);

     assert.equal(ask, PRICE_1, "Ask price should be set correctly1");
     assert.equal(ask1, PRICE_1, "Ask price should be set correctly2");
   });

   it("can update an ask", async () => {
     await canvas.ask(sectionId, PRICE_2, {from: accounts[0]});
     let ask = await canvas.getAsk(sectionId);

     assert.equal(ask, PRICE_2, "Ask price should be set correctly");
   });
   
   it("can delete an ask", async () => {
     await canvas.removeAsk(sectionId, {from: accounts[0]});
     let ask = await canvas.getAsk(sectionId);

     assert.equal(ask, 0, "Ask price should be set correctly");
   });

   it("can accept an offer", async () => {
     await canvas.offer(sectionId1, {from: accounts[0], value: PRICE_3});
     await canvas.ask(sectionId1, PRICE_3, {from: accounts[1]});
     let ask = await canvas.getAsk(sectionId1);
     let owner = await canvas.getOwner(sectionId1);

     assert.equal(ask, 0, "Ask should be 0");
     assert.equal(owner, accounts[0], "Ask price should be set correctly");

     await canvas.ask(sectionId1, PRICE_1, {from: accounts[0]});
   });

   it("can accept an offer when ask is lower", async () => {
     await canvas.getSectionForFree(sectionId3, {from: accounts[0]});
     await canvas.offer(sectionId3, {from: accounts[1], value: PRICE_1});

     let startingBalance0 = web3.utils.toBN(await web3.eth.getBalance(accounts[0]));
     let startingBalance1 = web3.utils.toBN(await web3.eth.getBalance(accounts[1]));
     await canvas.ask(sectionId3, PRICE_3, {from: accounts[0]});
     let endingBalance0 = web3.utils.toBN(await web3.eth.getBalance(accounts[0]));
     let endingBalance1 = web3.utils.toBN(await web3.eth.getBalance(accounts[1]));
     let offerPrice = web3.utils.toBN(PRICE_1);
     let ask = await canvas.getAsk(sectionId3);
     let owner = await canvas.getOwner(sectionId3);

     assert.equal(ask, 0, "Ask should be 0");
     assert.equal(owner, accounts[1], "Ask price should be set correctly");
     assert.equal(startingBalance1.toString().substring(0,3), endingBalance1.toString().substring(0,3)); //Balances same for new owner
     assert.equal(startingBalance0.add(offerPrice).toString().substring(0,3), endingBalance0.toString().substring(0,3)); //Got money for the seller

   });

   it("can accept the highest offer", async () => {
     await canvas.getSectionForFree(sectionId4, {from: accounts[0]});
     await canvas.offer(sectionId4, {from: accounts[2], value: PRICE_1});
     await canvas.offer(sectionId4, {from: accounts[1], value: PRICE_2});
     await canvas.offer(sectionId4, {from: accounts[3], value: PRICE_3});
     let startingBalance = web3.utils.toBN(await web3.eth.getBalance(accounts[0]));

     await canvas.ask(sectionId4, PRICE_1, {from: accounts[0]}); //Even though we're using a lower price, still take the highest (offer 2)
     let offers = await canvas.getOffersForSection(sectionId4);
     let owner = await canvas.getOwner(sectionId4);
     let endingBalance = web3.utils.toBN(await web3.eth.getBalance(accounts[0]));
     let offerPrice = web3.utils.toBN(PRICE_2);

    //  console.log(startingBalance.toString());
    //  console.log(endingBalance.toString());
     assert.equal(owner, accounts[1], "Owner should be set correctly");
     assert.equal(offers.length, 2, "Offer should be removed");
     assert.equal(offers[0].amount, PRICE_1, "First offer is now .5 ether");
     assert.equal(offers[1].amount, PRICE_3, "Second offer is now .1 ether");
     assert.equal(offers[0].offerer, accounts[2], "Offerer should be set correctly1");
     assert.equal(offers[1].offerer, accounts[3], "Offerer should be set correctly2");
     assert.equal(startingBalance.add(offerPrice).toString().substring(0,3), endingBalance.toString().substring(0,3));
   });

  //  it("can create ask if its higher than current offers", async () => {
  //  });

   //Error cases
   it("cannot create or update an ask for non-owner", async () => {
     await truffleAssert.reverts(
       canvas.ask(sectionId1, PRICE_1, {from: accounts[2]})
     );
   });

   it("cannot delete an ask for non-owner", async () => {
     await truffleAssert.reverts(
       canvas.removeAsk(sectionId, {from: accounts[1]})
     );
   });

   it("cannot ask for low value (safety check)", async () => {
     await truffleAssert.reverts(
       canvas.ask(sectionId, "100", {from: accounts[1]})
     );
   });

   it("Out of bounds check - ask", async () => {
     await truffleAssert.reverts(
       canvas.ask(SECTION_ID_INVALID, PRICE_1, {from: accounts[0]})
     );
   });

   it("Out of bounds check - removeAsk", async () => {
     await truffleAssert.reverts(
       canvas.removeAsk(SECTION_ID_INVALID, {from: accounts[0]})
     );
   });

 });


 describe("test offers", async () => {

   //Happy path
   it("can create an offer", async () => {
    await canvas.removeAsk(sectionId, {from: accounts[0]});
    await canvas.removeAsk(sectionId1, {from: accounts[0]});

     await canvas.offer(sectionId, {from: accounts[1], value: PRICE_1});
     let offers = await canvas.getOffersForSection(sectionId);

     await canvas.offer(sectionId1, {from: accounts[1], value: PRICE_1});
     let  offers2 = await canvas.getOffersForSection(sectionId1);

     assert.equal(offers[0].amount, PRICE_1, "Offer price should be set correctly1");
     assert.equal(offers[0].offerer, accounts[1], "Offerer should be set correctly1");
     assert.equal(offers2[0].amount, PRICE_1, "Offer price should be set correctly2");
     assert.equal(offers2[0].offerer, accounts[1], "Offerer should be set correctly2");
     assert.equal(offers.length, 1, "Offer should be added");
     assert.equal(offers2.length, 1, "Offer should be added2");
   });

   it("cannot update an offer", async () => {
     await truffleAssert.reverts(
       canvas.offer(sectionId, {from: accounts[1], value: PRICE_2})
     );
   });
   
   it("can delete an offer", async () => {
     let startingBalance = web3.utils.toBN(await web3.eth.getBalance(accounts[1]));

     await canvas.removeOffer(sectionId, {from: accounts[1]});
     let offers = await canvas.getOffersForSection(sectionId);

     let endingBalance = web3.utils.toBN(await web3.eth.getBalance(accounts[1]));
     let offerPrice = web3.utils.toBN(PRICE_1);

     assert.equal(offers.length, 0, "Offer should be removed");
     //Checks the first few digits of the account balance is the same.  Due to gas prices won't be an exact match
     assert.equal(startingBalance.add(offerPrice).toString().substring(0,3), endingBalance.toString().substring(0,3));

   });

   it("can get a section if offer matches ask", async () => {
     await canvas.getSectionForFree(sectionId2, { from: accounts[2] });
     await canvas.ask(sectionId2, PRICE_1, {from: accounts[2]});

     await canvas.offer(sectionId2, {from: accounts[1], value: PRICE_1});
     let offers = await canvas.getOffersForSection(sectionId2);
     let owner = await canvas.getOwner(sectionId2);
     let ask = await canvas.getAsk(sectionId2);

     assert.equal(offers.length, 0, "Offer should be removed");
     assert.equal(owner, accounts[1], "Owner should be updated");
     assert.equal(ask, 0, "Ask should be removed");
   });

  //  it("cannot offer lower than current ask", async () => {
  //  });


   //Error cases
   it("cannot create an offer for owner", async () => {
     await truffleAssert.reverts(
       canvas.offer(sectionId1, {from: accounts[1], value: PRICE_1})
     );
   });

   it("cannot create an offer higher than the ask", async () => {
     await truffleAssert.reverts(
       canvas.offer(sectionId1, {from: accounts[1], value: PRICE_1})
     );
   });

   it("cannot get a section if offer is higher than ask", async () => {
     await canvas.ask(sectionId2, PRICE_1, {from: accounts[1]});
     await truffleAssert.reverts(
        canvas.offer(sectionId2, {from: accounts[2], value: PRICE_2})
     );
   });


   it("cannot delete an offer for non-owner", async () => {
     await truffleAssert.reverts(
       canvas.removeOffer(sectionId1, {from: accounts[2]})
     );
   });

   it("Out of bounds check - offer", async () => {
     await truffleAssert.reverts(
       canvas.offer(SECTION_ID_INVALID, {from: accounts[0], value: PRICE_1})
     );
   });

   it("Out of bounds check - removeOffer", async () => {
     await truffleAssert.reverts(
       canvas.removeOffer(SECTION_ID_INVALID, {from: accounts[0]})
     );
   });

 });

 describe("test fetching sections", async () => {
   it("can fetch sections", async () => {
    //  const sections = await canvas.getSections({from :accounts[0]});

    const ARR_LEN = 7056;
    const PAGES = 28;
    const LENGTH = ARR_LEN / PAGES;

    let result = [];
    let cursor = 0;

    for (let i = 0; i < PAGES; i++) {
      // console.log("iterating");

      let x = await canvas.fetchSections(cursor, LENGTH);
      result = result.concat(x);
      cursor += LENGTH;

      // console.log("result length: " + result.length);
      // console.log("cursor:" + cursor);
    }
     const section = result[sectionId];


     assert.equal(result.length, 7056);
     assert.equal(section.owner, accounts[0]);
   });

   it("can fetch sections when length is too big", async () => {
    //  const sections = await canvas.getSections({from :accounts[0]});

    const ARR_LEN = 7056;
    const LENGTH = 100;

    let result = [];
    let cursor = ARR_LEN - 50;

    let x = await canvas.fetchSections(cursor, LENGTH);
    result = result.concat(x);

    assert.equal(result.length, 50);
   });

 });

});
