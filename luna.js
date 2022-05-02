import fetch from 'isomorphic-fetch';
import { MsgSwap,MsgExecuteContract, MnemonicKey, Coins, LCDClient, Coin } from '@terra-money/terra.js';

// Fetch gas prices and convert to `Coin` format.
const gasPrices = await (await fetch('https://bombay-fcd.terra.dev/v1/txs/gas_prices')).json();

const gasPricesCoins = new Coins(gasPrices);

const lcd = new LCDClient({
  URL: "https://lcd.terra.dev",
  chainID: "columbus-5"
});

const test = new LCDClient({
  URL: "https://bombay-lcd.terra.dev/",
  chainID: "bombay-12",
});

const mk = new MnemonicKey({
  mnemonic: 
});
const wallet = test.wallet(mk);


// check if there is luna in wallet 
async function walletCheck(){
  const [balance] = await test.bank.balance(wallet.key.accAddress);
  for(let i = 0; i< balance.toData().length;i++){
    if(balance.toData()[i]["denom"] == "uluna"){
      return balance.toData()[i]["amount"]
    }
    return 0
  }
}

async function checkPriceDiff(amount){
  const cluna =  await  getClunaPrice()
  const luna = await getLunaPrice()
  const div = luna/cluna
  if(div>1.02){
    lunaToCluna(amount,div)
  }
}
//luna to cluna
async function lunaToCluna(amount,div){
  const msg = {
    "execute_swap_operations": {
      "operations": [
        {
          "prism_swap": {
            "ask_asset_info": {
              "cw20": "terra1cwle4remlf03mucutzhxfayvmdqsulx8xaahvy"
            },
            "offer_asset_info": {
              "native": "uluna"
            }
          }
        },
        {
          "prism_swap": {
            "ask_asset_info": {
              "cw20": "terra108kj35ef46tptcw69a0x5r9qkfu8h7vmjp6w39"
            },
            "offer_asset_info": {
              "cw20": "terra1cwle4remlf03mucutzhxfayvmdqsulx8xaahvy"
            }
          }
        }
      ],
      "offer_amount": String(amount),
      "minimum_receive": String(div*amount*0.98)
    }
  }
  const swap = new MsgExecuteContract(
    wallet.key.accAddress,
    "terra1hn2dlykp8k5uspy6np5ks27060wnav6stmpvm5",
    msg,
    { uluna: 1000000 }
  );
  const tx = await wallet.createAndSignTx({ msgs: [swap]});
  const result = await test.tx.broadcast(tx);
  return result
}

console.log(lunaToCluna())



async function getPrisimPirce(amount){
  const prismPrice = await lcd.wasm.contractQuery(
    "terra19d2alknajcngdezrdhq40h6362k92kz23sz62u",
    {
      "reverse_simulation": {
        "ask_asset": {
          "info": {
            "cw20":"terra1dh9478k2qvqhqeajhn75a2a7dsnf74y5ukregw"
            },
          "amount": amount
        }
      }
    }
  )
  return prismPrice.offer_amount/1000000
}

async function getClunaPrice(){
  const clunaPrice = await lcd.wasm.contractQuery(
    "terra1yxgq5y6mw30xy9mmvz9mllneddy9jaxndrphvk",
    {
      "reverse_simulation": {
        "ask_asset": {
          "info": {
            "cw20":"terra13zaagrrrxj47qjwczsczujlvnnntde7fdt0mau"
            },
          "amount": "1000000"
        }
      }
    }
  ).then(result=>{return getPrisimPirce(String(result.offer_amount))})
  return clunaPrice
}
// console.log( await  getClunaPrice())

async function getLunaPrice(){
  const lunaPrice = await lcd.wasm.contractQuery(
    "terra1r38qlqt69lez4nja5h56qwf4drzjpnu8gz04jd",
    {
      "reverse_simulation": {
        "ask_asset": {
          "info": {
            "native": "uluna"
            },
          "amount": "1000000"
        }
      }
    }
  ).then(result=>{return getPrisimPirce(String(result.offer_amount))})
  return lunaPrice
}
console.log(await getLunaPrice())

const unbond = new MsgExecuteContract(
  wallet.key.accAddress,
  "terra108kj35ef46tptcw69a0x5r9qkfu8h7vmjp6w39",
  {
    "send": {
      "msg": "eyJ1bmJvbmQiOnt9fQ==",
      "amount": "1000000",
      "contract": "terra1knak0taqkas4y07mupvxpr89kvtew5dx9jystw"
    }
  }
);

// const tx = await wallet.createAndSignTx({ msgs: [unbond]});
// const result = await test.tx.broadcast(tx);
// console.log(result)

// async function f(){
//   const result = await lcd.wasm.contractQuery(
//   "terra19d2alknajcngdezrdhq40h6362k92kz23sz62u",
//   {
//     "reverse_simulation": {
//       "ask_asset": {
//         "info": {
//           "cw20":"terra1dh9478k2qvqhqeajhn75a2a7dsnf74y5ukregw"
//           },
//         "amount": "1000000"
//       }
//     }
//   })
//   return result
// }
// console.log(await f())

// const query = {
//   "simulation": {
//     "offer_asset": {
//       "info": {
//         "native": "uusd"
//       },
//       "amount": "1000000"
//     }
//   }
// }

// const reverse_query = {
//   "reverse_simulation": {
//     "ask_asset": {
//       "info": {
//         "cw20":"terra1dh9478k2qvqhqeajhn75a2a7dsnf74y5ukregw"
//         },
//       "amount": "1000000"
//     }
//   }
// }
