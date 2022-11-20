# BeatMeIfYouCan.xyz

Moralis + Google Hackathon Entry

## Files

* local-multiplayer-prototype
  * index.html
    * self contained local mutliplayer prototype of the gameplay for tesing and balancing
  
## TODO

[x] PvP without Blockchain

[x] Create game smartcontract

[x] Frontend - Wallet connect

[x] Frontend - Lobby - Open games list

[x] Frontend - Open game

[ ] Frontend - Close game

[ ] Frontend - Reveal opening

[ ] Frontend - Reveal close

[ ] Frontend - Lobby - Leaderboard

[ ] Frontend - Show challengers

[ ] Frontend - Save salts

[x] Backend - Colate smartcontract events

[x] Backend - Colate games into Moralis DB

[x] Backend - Provide API to frontend

## Deployment

### New Smart Contract

1. cloud/contract.js
    * replace address, abi from remix
2. website/js/contract.js
    * copy above file here
3. Moralis > Servers > Settings > Syncs > Smart Contract > Add New Sync > Custom Event > Table Name: Update