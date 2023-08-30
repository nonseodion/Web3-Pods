import { useEffect, useState } from "react"; 
import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { ParticleAuthModule, ParticleProvider } from "@biconomy/particle-auth";
import { ethers } from "ethers";
import { IBundler, Bundler } from "@biconomy/bundler";
import {
  BiconomySmartAccount,
  BiconomySmartAccountConfig,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from "@biconomy/account";
import { ChainId } from "@biconomy/core-types";
import { IPaymaster, BiconomyPaymaster } from "@biconomy/paymaster";
import Minter from "../components/Minter";

const particle = new ParticleAuthModule.ParticleNetwork({
  projectId: "bce136fd-0a1c-462e-b07a-111bfb50f0b3",
  clientKey: "czotlqLY2LS059VbTYRmLQ3rcx5n3zhXa8J23j23",
  appId: "585a5a3b-4a4b-4d55-a80c-94b422b28dc7",
  wallet: {
    displayWalletEntry: true,
    defaultWalletEntryPosition: ParticleAuthModule.WalletEntryPosition.BR,
  },
});


const bundler: IBundler = new Bundler({
    bundlerUrl:"https://bundler.biconomy.io/api/v2/84531/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
    chainId: ChainId.BASE_GOERLI_TESTNET,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  })
  
const paymaster: IPaymaster = new BiconomyPaymaster({
  paymasterUrl: "https://paymaster.biconomy.io/api/v1/84531/CNnMeQGyt.afe2e811-240d-44df-a4f1-0a280c78d9f4"
})



export default function Home() {
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [smartAccount, setSmartAccount] =
    useState<BiconomySmartAccount | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Provider | null>(
    null
  );
  
  // set user data if logged in
  useEffect(() => {
    (async () => {
      const userInfo = await particle.auth.isLoginAsync();
      if(userInfo){
        await setDetails();
      }
    })();
  }, []);
  
  const setDetails = async () => {
    const particleProvider = new ParticleProvider(particle.auth);
    const web3Provider = new ethers.providers.Web3Provider(
      particleProvider,
      "any"
    );
    setProvider(web3Provider);
    const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
      signer: web3Provider.getSigner(),
      chainId: ChainId.BASE_GOERLI_TESTNET,
      bundler: bundler,
      paymaster: paymaster,
    };
    let biconomySmartAccount = new BiconomySmartAccount(
      biconomySmartAccountConfig
    );
    biconomySmartAccount = await biconomySmartAccount.init();
    setAddress(await biconomySmartAccount.getSmartAccountAddress());
    setSmartAccount(biconomySmartAccount);
  }

  const connect = async () => {
    try {
      setLoading(true);
      const userInfo = await particle.auth.login();
      console.log("Logged in user:", userInfo);
      await setDetails();
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };


  return (
    <>
      <Head>
        <title>Web3Pods</title>
        <meta name="description" content="Web3Pods" />
      </Head>
      <main className={styles.main}>
        <div className={styles.submain}>
          <h1>Web3Pods</h1>
          {!smartAccount && <p>Login to mint a pod.</p>}
          {!loading && !address && (
            <button onClick={connect} className={styles.connect}>
              Login
            </button>
          )}
          {loading && <p>Loading Smart Account...</p>}
          {address && (
            <h2>
              Smart Account:{" "}
              <a
                href={`https://goerli.basescan.org/address/${address}`}
                className={styles.address}
                target="_blank"
              >
                {address.slice(0, 6)}...{address.slice(-5, -1)}
              </a>
            </h2>
          )}
          {smartAccount && provider && (
            <Minter
              smartAccount={smartAccount}
              address={address}
              provider={provider}
            />
          )}
        </div>
      </main>
    </>
  );
}
