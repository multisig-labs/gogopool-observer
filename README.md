# GoGo-Observer

(re)Actions for on-chain events. Uses Tenderly Actions and Vitest for local development.

## Setup

While installing dependencies for the root as well as the actions folder, copy over the `env.example` file to a `.env` file.

```bash
# ./ (in root) install deps for local dev
npm i

# ./src/actions install deps to ship over to serverless land 🏝️
cd ./src/actions
npm i
```

## Adding a new address for Tendrly Web3 Action notification tracking

1. Add deployed contract address to tenderly.yaml file

```
- network: 43114
  eventEmitted:
    contract:
      address: 0xf451171872e9395021316e44D9f5475C90e27848
    name: HardwareRented
  status: success
```

2. Verify the contract on Tenderly `GoGoPool-Testnet` project.
   - https://dashboard.tenderly.co/multisiglabs/gogopool/contracts
   - Add the contract without giving it a name
   - Verify the proxy contract via ABI upload in the Tenderly UI using the TransparentUpgradeableProxy ABI
   - And verify the implementation contract in the Tenderly UI using the implementation ABI

## Testing

Testing is handled with Vitest. Since some of these tests use real data, they will not be emit by default. Emitting therefore will be OPT-IN - that is, you must disable the emitter being tested. This can be safely done if using something like `only` for a test, so no other tests are run. The only one this effects now is the artifact channel that is sent to Knock at the moment.

```bash
# Start vitest in visual mode. How exciting!
npm run test
```

The tests use a payload in the aptly named `payload` folder which contains a single transaction receipt. The tests basically mock having that event triggered and how to respond. The functions are designed to "throw" if the event shouldn't have been responded to. This is to make it let Tenderly handle the errors, emailing team members to the problem, and being visible errors on the dashboard.

I have this in BetterTouchTool set to a hotkey to get the tx receipt. Could use `cast receipt <tx> --rpc-url https://api.avax.network/ext/bc/C/rpc` as well.

## Deployment

Deployment happens either through GitHub Actions or locally.

### Locally

Call `tenderly actions deploy` which will upload the whole lot to Tenderly with some helpful output.

```bash
npm run deploy
```

### GitHub Actions

On every push, this action will deploy the actions to Tenderly. This is important to ensure that what exists on Tenderly is synched with what's in GitHub.

🚨 `TENDERLY_ACCESS_KEY` and `TENDERLY_EMAIL` must be set in a GitHub environment called "production"! If it's not called "production", make sure to update the github-actions-deploy.yaml! 🚨
