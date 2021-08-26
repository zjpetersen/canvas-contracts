// const Canvas = artifacts.require("./MosaicMarket.sol");
const Canvas = artifacts.require("./MosaicTiles.sol");
const { assert } = require('chai');
const truffleAssert = require('truffle-assertions');

contract("Canvas", (accounts) => {
 let canvas;
 let tokenId = 15;
 let expectedOwner;
 let tokenId1 = 1;
 let tokenId2 = 2;
 let tokenId3 = 3;
 let tokenId4 = 4;
 let expectedOwner1;
 let expectedOwner3;
 const TILE_ID_NEG = -1;
 const TILE_ID_INVALID = 7056;
 const PRICE_1 = "500000000000000000"; //.5 ether
 const PRICE_2 = "3000000000000000000"; //3 ether
 const PRICE_3 = "100000000000000000"; //.1 ether
 const PRICE_NEG = -3;

  before(async () => {
    canvas = await Canvas.deployed();
  });

 describe("test get owner", async () => {
   it("can get owner", async () => {
     const actualOwner = await canvas.getOwner(tokenId, {from :accounts[0]});

     assert.equal(actualOwner, '0x0000000000000000000000000000000000000000', "The owner of the free tile should be empty");
   });

   it("cannot get owner for invalid token", async () => {
     await truffleAssert.reverts(
       canvas.getOwner(TILE_ID_INVALID, { from: accounts[0] }));
   });

 });

 describe("test getting free tile", async () => {
  //  let expectedOwner;
   before("get a free tile", async () => {
     await canvas.mintTile(tokenId, { from: accounts[0] });
     expectedOwner = accounts[0];
     await canvas.mintTile(tokenId1, { from: accounts[1] });
     expectedOwner1 = accounts[1];
     expectedOwner3 = accounts[3];
   });

   it("can assign owner to free tile properly", async () => {
     const actualOwner = await canvas.getOwner(tokenId);

     assert.equal(actualOwner, expectedOwner, "The owner of the free tile should be first account");
   });

   it("can assign owner to free tile properly 1", async () => {
     const actualOwner = await canvas.getOwner(tokenId1);

     assert.equal(actualOwner, expectedOwner1, "The owner of the free tile should be second account");
   });

   it("cannot assign owner to already owned tile", async () => {
     await truffleAssert.reverts(
       canvas.mintTile(tokenId, { from: accounts[0] }));
   });

   it("cannot assign owner to already owned tile", async () => {
     await truffleAssert.reverts(
       canvas.mintTile(tokenId, { from: accounts[1] }));
   });

   it("can bulk assign owner to free tile properly", async () => {
     let tokenIds = [50,51,52,53,54,55,56,57,58,59,
                60,61,62,63,64,65,66,67,68,69];
     await canvas.mintTiles(tokenIds, { from: accounts[3] });
     const actualOwner = await canvas.getOwner(50);
     const actualOwner2 = await canvas.getOwner(55);
     const actualOwner3 = await canvas.getOwner(69);

     assert.equal(actualOwner, expectedOwner3, "The owner of the free tile should be first account");
     assert.equal(actualOwner2, expectedOwner3, "The owner of the free tile should be first account");
     assert.equal(actualOwner3, expectedOwner3, "The owner of the free tile should be first account");
   });

   it("can bulk assign single tile", async () => {
     let tokenIds = [200];
     await canvas.mintTiles(tokenIds, { from: accounts[0] });
     const actualOwner = await canvas.getOwner(200);

     assert.equal(actualOwner, expectedOwner, "The owner of the free tile should be first account");
   })

   it("cannot bulk assign over 20 tiles at once", async () => {
     let tokenIds = [50,51,52,53,54,55,56,57,58,59,
                60,61,62,63,64,65,66,67,68,69,70];
      await truffleAssert.reverts(
        canvas.mintTiles(tokenIds, {from: accounts[3]})
      );
   });

   it("cannot bulk assign invalid tile", async () => {
     let tokenIds = [TILE_ID_INVALID];
      await truffleAssert.reverts(
        canvas.mintTiles(tokenIds, {from: accounts[3]})
      );
   });
   
   it("cannot bulk assign empty array", async () => {
     let tokenIds = [];
      await truffleAssert.reverts(
        canvas.mintTiles(tokenIds, {from: accounts[3]})
      );
   })

   it("cannot bulk assign over 100 tiles to same owner", async () => {
     let tokenIds = [500,501,502,503,504,505,506,507,508,509,
                600,601,602,603,604,605,606,607,608,609];
     let tokenIds2 = [510,511,512,513,514,515,516,517,518,519,
                610,611,612,613,614,615,616,617,618,619];
     let tokenIds3 = [520,521,522,523,524,525,526,527,528,529,
                620,621,622,623,624,625,626,627,628,629];
     let tokenIds4 = [530,531,532,533,534,535,536,537,0,7055,
                630,631,632,633,634,635,636,637,638,639];
     await canvas.mintTiles(tokenIds, { from: accounts[3] });
     await canvas.mintTiles(tokenIds2, { from: accounts[3] });
     await canvas.mintTiles(tokenIds3, { from: accounts[3] });
     await canvas.mintTiles(tokenIds4, { from: accounts[3] });

     const actualOwner = await canvas.getOwner(509);
     const actualOwner2 = await canvas.getOwner(639);

     assert.equal(actualOwner, expectedOwner3, "The owner of the free tile should be first account");
     assert.equal(actualOwner2, expectedOwner3, "The owner of the free tile should be first account");

      await truffleAssert.reverts(
        canvas.mintTiles([1000], {from: accounts[3]})
      );

      await truffleAssert.reverts(
        canvas.mintTile(1000, {from: accounts[3]})
      );
   });
   
   it("cannot bulk assign invalid tile", async () => {
     let tokenIds = [50,51,52,53,54,55,56,57,58,7056,
                60,61,62,63,64,65,66,67,68,69,70];
      await truffleAssert.reverts(
        canvas.mintTiles(tokenIds, {from: accounts[0]})
      );
   })

   it("cannot mint an existing tile", async () => {
     let tokenId = 500;
     let tokenIds = [500];
      await truffleAssert.reverts(
        canvas.mintTile(tokenId, {from: accounts[3]})
      );
      
      await truffleAssert.reverts(
        canvas.mintTile(tokenId, {from: accounts[1]})
      );

      await truffleAssert.reverts(
        canvas.mintTiles(tokenIds, {from: accounts[3]})
      );
   })

   it("cannot assign invalid tile", async () => {
     let tokenId = 7056;
     let tokenId2 = 40000;
      await truffleAssert.reverts(
        canvas.mintTile(tokenId, {from: accounts[0]})
      );

      await truffleAssert.reverts(
        canvas.mintTile(tokenId2, {from: accounts[0]})
      );
   })

 });

 describe("test get tile", async () => {
   it("can get owner", async () => {
     const owner = await canvas.getOwner(tokenId1, {from :accounts[0]});
     
     assert.equal(owner, accounts[1], "Can access properties correctly");
   });
 });

 describe("test get uri", async () => {
   it("can get uri", async () => {
     const uri = await canvas.tokenURI(tokenId1, {from :accounts[0]});
     
     assert.equal(uri, "localhost:4000/tile/metadata/1", "Can access properties correctly");
   });
 });

 describe("test token exists", async () => {
   it("can get true for existing token", async () => {
     const result = await canvas.exists(tokenId1, {from :accounts[0]});
     
     assert.equal(result, true, "Can get true for existing token");
   });

   it("can get false for non existing token", async () => {
     const result = await canvas.exists(5839, {from :accounts[0]});
     
     assert.equal(result, false, "Can get false for non existing token");
   });

   it("cannot check if invalid tile exists", async () => {
      await truffleAssert.reverts(
        canvas.exists(TILE_ID_INVALID, {from: accounts[0]})
      );
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
       canvas.setColorBytes(tokenId1, expectedColor, { from: accounts[0] }));
   });

   it("cannot set color for unminted token", async () => {
     await truffleAssert.reverts(
       canvas.setColorBytes(5678, expectedColor, { from: accounts[0] }));
   });

   it("cannot set color for invalid token", async () => {
     await truffleAssert.reverts(
       canvas.setColorBytes(TILE_ID_INVALID, expectedColor, { from: accounts[0] }));
   });

   it("cannot set color for very large color", async () => {

     let expectedColor='0x';
     let invalidLength = 5000;
     for (let i = 0; i < invalidLength+1; i++) {
       expectedColor+='abcd';
     }
     await truffleAssert.reverts(
       canvas.setColorBytes(tokenId1, expectedColor, { from: accounts[1] }));
   });

   it("can set color for owner", async () => {
     let tx = await canvas.setColorBytes(tokenId1, expectedColor, {from: accounts[1]});
     truffleAssert.eventEmitted(tx, 'ColorBytesUpdated', (ev) => {
       return ev.updatedColor === hex;
     });
   });

   it("can set color a second time", async () => {
     let tx = await canvas.setColorBytes(tokenId1, expectedColor, {from: accounts[1]});
     truffleAssert.eventEmitted(tx, 'ColorBytesUpdated', (ev) => {
       return ev.updatedColor === hex;
     });
   });

   it("can bulk set color for owner", async () => {
     let tokenIds = [50,51,52,53,54,55,56,57,58,59,
                60,61,62,63,64,65,66,67,68,69];
      let e = expectedColor;
      let colors = [e,e,e,e,e,e,e,e,e,e,
                    e,e,e,e,e,e,e,e,e,e];

     let tx = await canvas.setColorBytesBulk(tokenIds, colors, {from: accounts[3]});
     truffleAssert.eventEmitted(tx, 'ColorBytesUpdated', (ev) => {
       return ev.updatedColor === hex;
     });
   });

   it("cannot bulk set color for non-owner", async () => {
     let tokenIds = [50,51,52,53,54,55,56,57,58,59,
                60,61,62,63,64,65,66,67,68,69];
      let e = expectedColor;
      let colors = [e,e,e,e,e,e,e,e,e,e,
                    e,e,e,e,e,e,e,e,e,e];
     await truffleAssert.reverts(
       canvas.setColorBytesBulk(tokenIds, colors, { from: accounts[0] }));
   });

   it("cannot bulk set color if mismatched input lengths", async () => {
     let tokenIds = [50,51,52,53,54,55,56,57,58,59,
                60,61,62,63,64,65,66,67,68,69];
      let e = expectedColor;
      let colors = [e,e,e,e,e,e,e,e,e,e,
                    e,e,e,e,e,e,e,e,e];
     await truffleAssert.reverts(
       canvas.setColorBytesBulk(tokenIds, colors, { from: accounts[3] }));
   });

   it("cannot bulk set color if empty array", async () => {
     let tokenIds = [];
      let colors = [];
     await truffleAssert.reverts(
       canvas.setColorBytesBulk(tokenIds, colors, { from: accounts[3] }));
   });

 });


//  describe("test asks", async () => {

//    //Happy path
//    it("can create an ask", async () => {
//      await canvas.ask(tokenId, PRICE_1, {from: accounts[0]});
//      let ask = await canvas.getAsk(tokenId);

//      await canvas.ask(tokenId1,PRICE_1, {from: accounts[1]});
//      let ask1 = await canvas.getAsk(tokenId);

//      assert.equal(ask, PRICE_1, "Ask price should be set correctly1");
//      assert.equal(ask1, PRICE_1, "Ask price should be set correctly2");
//    });

//    it("can update an ask", async () => {
//      await canvas.ask(tokenId, PRICE_2, {from: accounts[0]});
//      let ask = await canvas.getAsk(tokenId);

//      assert.equal(ask, PRICE_2, "Ask price should be set correctly");
//    });
   
//    it("can delete an ask", async () => {
//      await canvas.removeAsk(tokenId, {from: accounts[0]});
//      let ask = await canvas.getAsk(tokenId);

//      assert.equal(ask, 0, "Ask price should be set correctly");
//    });

//    it("can accept an offer", async () => {
//      await canvas.offer(tokenId1, {from: accounts[0], value: PRICE_3});
//      await canvas.ask(tokenId1, PRICE_3, {from: accounts[1]});
//      await canvas.withdraw({from: accounts[1]});
//      let ask = await canvas.getAsk(tokenId1);
//      let owner = await canvas.getOwner(tokenId1);

//      assert.equal(ask.toString(), 0, "Ask should be 0");
//      assert.equal(owner, accounts[0], "Owner should be set correctly");

//      await canvas.ask(tokenId1, PRICE_1, {from: accounts[0]});
//    });

//    it("can accept an offer when ask is lower", async () => {
//      await canvas.mintTile(tokenId3, {from: accounts[0]});
//      await canvas.offer(tokenId3, {from: accounts[1], value: PRICE_1});

//      let startingBalance0 = web3.utils.toBN(await web3.eth.getBalance(accounts[0]));
//      let startingBalance1 = web3.utils.toBN(await web3.eth.getBalance(accounts[1]));
//      await canvas.ask(tokenId3, PRICE_3, {from: accounts[0]});
//      await canvas.withdraw({from: accounts[0]});
//      let endingBalance0 = web3.utils.toBN(await web3.eth.getBalance(accounts[0]));
//      let endingBalance1 = web3.utils.toBN(await web3.eth.getBalance(accounts[1]));
//      let offerPrice = web3.utils.toBN(PRICE_1);
//      let ask = await canvas.getAsk(tokenId3);
//      let owner = await canvas.getOwner(tokenId3);


//      assert.equal(ask, 0, "Ask should be 0");
//      assert.equal(owner, accounts[1], "Ask price should be set correctly");
//      assert.equal(startingBalance1.toString().substring(0,3), endingBalance1.toString().substring(0,3)); //Balances same for new owner
//      assert.equal(startingBalance0.add(offerPrice).toString().substring(0,3), endingBalance0.toString().substring(0,3)); //Got money for the seller

//    });

//    it("can accept the highest offer", async () => {
//      await canvas.mintTile(tokenId4, {from: accounts[0]});
//      await canvas.offer(tokenId4, {from: accounts[2], value: PRICE_1});
//      await canvas.offer(tokenId4, {from: accounts[1], value: PRICE_2});
//      await canvas.offer(tokenId4, {from: accounts[3], value: PRICE_3});
//      let startingBalance = web3.utils.toBN(await web3.eth.getBalance(accounts[0]));

//      await canvas.ask(tokenId4, PRICE_1, {from: accounts[0]}); //Even though we're using a lower price, still take the highest (offer 2)
//      await canvas.withdraw({from: accounts[0]});
//      let offers = await canvas.getOffersForTile(tokenId4);
//      let owner = await canvas.getOwner(tokenId4);
//      let endingBalance = web3.utils.toBN(await web3.eth.getBalance(accounts[0]));
//      let offerPrice = web3.utils.toBN(PRICE_2);

//     //  console.log(startingBalance.toString());
//     //  console.log(endingBalance.toString());
//      assert.equal(owner, accounts[1], "Owner should be set correctly");
//      assert.equal(offers.length, 2, "Offer should be removed");
//      assert.equal(offers[0].amount, PRICE_1, "First offer is now .5 ether");
//      assert.equal(offers[1].amount, PRICE_3, "Second offer is now .1 ether");
//      assert.equal(offers[0].offerer, accounts[2], "Offerer should be set correctly1");
//      assert.equal(offers[1].offerer, accounts[3], "Offerer should be set correctly2");
//      assert.equal(startingBalance.add(offerPrice).toString().substring(0,3), endingBalance.toString().substring(0,3));
//    });

//   //  it("can create ask if its higher than current offers", async () => {
//   //  });

//    //Error cases
//    it("cannot create or update an ask for non-owner", async () => {
//      await truffleAssert.reverts(
//        canvas.ask(tokenId1, PRICE_1, {from: accounts[2]})
//      );
//    });

//    it("cannot delete an ask for non-owner", async () => {
//      await truffleAssert.reverts(
//        canvas.removeAsk(tokenId, {from: accounts[1]})
//      );
//    });

//    it("cannot ask for low value (safety check)", async () => {
//      await truffleAssert.reverts(
//        canvas.ask(tokenId, "100", {from: accounts[1]})
//      );
//    });

//    it("Out of bounds check - ask", async () => {
//      await truffleAssert.reverts(
//        canvas.ask(TILE_ID_INVALID, PRICE_1, {from: accounts[0]})
//      );
//    });

//    it("Out of bounds check - removeAsk", async () => {
//      await truffleAssert.reverts(
//        canvas.removeAsk(TILE_ID_INVALID, {from: accounts[0]})
//      );
//    });

//  });


//  describe("test offers", async () => {

//    //Happy path
//    it("can create an offer", async () => {
//     await canvas.removeAsk(tokenId, {from: accounts[0]});
//     await canvas.removeAsk(tokenId1, {from: accounts[0]});

//      await canvas.offer(tokenId, {from: accounts[1], value: PRICE_1});
//      let offers = await canvas.getOffersForTile(tokenId);

//      await canvas.offer(tokenId1, {from: accounts[1], value: PRICE_1});
//      let  offers2 = await canvas.getOffersForTile(tokenId1);

//      assert.equal(offers[0].amount, PRICE_1, "Offer price should be set correctly1");
//      assert.equal(offers[0].offerer, accounts[1], "Offerer should be set correctly1");
//      assert.equal(offers2[0].amount, PRICE_1, "Offer price should be set correctly2");
//      assert.equal(offers2[0].offerer, accounts[1], "Offerer should be set correctly2");
//      assert.equal(offers.length, 1, "Offer should be added");
//      assert.equal(offers2.length, 1, "Offer should be added2");
//    });

//    it("cannot update an offer", async () => {
//      await truffleAssert.reverts(
//        canvas.offer(tokenId, {from: accounts[1], value: PRICE_2})
//      );
//    });
   
//    it("can delete an offer", async () => {
//      await canvas.removeOffer(tokenId, {from: accounts[1]});
//      let startingBalance = web3.utils.toBN(await web3.eth.getBalance(accounts[1]));
//      await canvas.withdraw({from: accounts[1]});
//      let offers = await canvas.getOffersForTile(tokenId);

//      let endingBalance = web3.utils.toBN(await web3.eth.getBalance(accounts[1]));
//      let offerPrice = web3.utils.toBN(PRICE_1);

//      assert.equal(offers.length, 0, "Offer should be removed");
//      //Checks the first few digits of the account balance is the same.  Due to gas prices won't be an exact match
//      assert.equal(startingBalance.add(offerPrice).toString().substring(0,3), endingBalance.toString().substring(0,3));

//    });

//    it("can get a tile if offer matches ask", async () => {
//      await canvas.mintTile(tokenId2, { from: accounts[2] });
//      await canvas.ask(tokenId2, PRICE_1, {from: accounts[2]});

//      await canvas.offer(tokenId2, {from: accounts[1], value: PRICE_1});
//      let offers = await canvas.getOffersForTile(tokenId2);
//      let owner = await canvas.getOwner(tokenId2);
//      let ask = await canvas.getAsk(tokenId2);

//      assert.equal(offers.length, 0, "Offer should be removed");
//      assert.equal(owner, accounts[1], "Owner should be updated");
//      assert.equal(ask, 0, "Ask should be removed");
//    });

//   //  it("cannot offer lower than current ask", async () => {
//   //  });


//    //Error cases
//    it("cannot create an offer for owner", async () => {
//      await truffleAssert.reverts(
//        canvas.offer(tokenId1, {from: accounts[1], value: PRICE_1})
//      );
//    });

//    it("cannot create an offer higher than the ask", async () => {
//      await truffleAssert.reverts(
//        canvas.offer(tokenId1, {from: accounts[1], value: PRICE_1})
//      );
//    });

//    it("cannot get a tile if offer is higher than ask", async () => {
//      await canvas.ask(tokenId2, PRICE_1, {from: accounts[1]});
//      await truffleAssert.reverts(
//         canvas.offer(tokenId2, {from: accounts[2], value: PRICE_2})
//      );
//    });


//    it("cannot delete an offer for non-owner", async () => {
//      await truffleAssert.reverts(
//        canvas.removeOffer(tokenId1, {from: accounts[2]})
//      );
//    });

//    it("Out of bounds check - offer", async () => {
//      await truffleAssert.reverts(
//        canvas.offer(TILE_ID_INVALID, {from: accounts[0], value: PRICE_1})
//      );
//    });

//    it("Out of bounds check - removeOffer", async () => {
//      await truffleAssert.reverts(
//        canvas.removeOffer(TILE_ID_INVALID, {from: accounts[0]})
//      );
//    });

//  });

});
