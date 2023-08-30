import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "../utils/abi.json";
import {
  IHybridPaymaster,
  SponsorUserOperationDto,
  PaymasterMode,
} from "@biconomy/paymaster";
import { BiconomySmartAccount } from "@biconomy/account";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import styles from "@/styles/Home.module.css";

const nftAddress = "0x53df9a7327DD8a84C27E81768c2ce7704E3e8B51";
interface Props {
  smartAccount: BiconomySmartAccount;
  address: string;
  provider: ethers.providers.Provider;
}

const jsonProvider = new ethers.providers.JsonRpcProvider(
  "https://base-goerli.public.blastapi.io"
);

let tokens: Number[] = [];

interface Podcast {
  name: "",
  episode: "",
  description: "",
  image: "",
  link: ""
}

const Minter: React.FC<Props> = ({ smartAccount, address, provider }) => {
  const [minted, setMinted] = useState<boolean>(false);
  const [minting, setMinting] = useState<boolean>(false);
  const contract = new ethers.Contract(nftAddress, abi, provider);
  const [podcast, setPodcast] = useState<Podcast>();

  const handleMint = async () => {
    setMinting(true);

    try {
      toast.info("Minting your NFT...", {
        position: "top-right",
        autoClose: 15000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });  
      const minTx = await contract.populateTransaction.mint();
      console.log(minTx.data);
      const tx1 = {
        to: nftAddress,
        data: minTx.data,
      };
      let userOp = await smartAccount.buildUserOp([tx1]);
      console.log({ userOp });
      const biconomyPaymaster =
        smartAccount.paymaster as IHybridPaymaster<SponsorUserOperationDto>;
      let paymasterServiceData: SponsorUserOperationDto = {
        mode: PaymasterMode.SPONSORED,
      };
      const paymasterAndDataResponse =
        await biconomyPaymaster.getPaymasterAndData(
          userOp,
          paymasterServiceData
        );

      userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
      const userOpResponse = await smartAccount.sendUserOp(userOp);
      console.log("userOpHash", userOpResponse);
      const { receipt } = await userOpResponse.wait(1);
      setMinting(false);
      setMinted(true);
      toast.success(
        `Success! Here is your transaction:${receipt.transactionHash} `,
        {
          position: "top-right",
          autoClose: 18000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
      console.log("txHash", receipt.transactionHash);
    } catch (err: any) {
      console.error(err);
      console.log(err);
    }
  };

  // check mint
  useEffect(() => {
    (async() => {
      console.log(address)
      const nftContract = new ethers.Contract(nftAddress, abi, jsonProvider);
      tokens = await nftContract.tokensOfOwner(address);
      if(tokens.length >= 1){
        setMinted(true);
        const tokenUri = await nftContract.tokenURI(tokens[0]);
        const res = await (await fetch(tokenUri)).json();
        
        // read nft metadata
        const podcast = {
          episode: res.name,
          name: res.attributes["podcast-name"],
          description: res.description,
          image: res.image,
          link: res.attributes["episode-link"]
        }

        setPodcast(podcast);
      }
      
    })();
  }, [minted])
 

  return (
    <>
      {address && !minted && (
        <button onClick={handleMint} className={styles.connect}>
          {!minting ? "Mint a Web3Pod" : "Minting"}
        </button>
      )}

      {podcast && (
        <div className={styles.podContainer}>
          <div className={styles.image}>
            <Image src={podcast.image} fill alt={""} />
          </div>
          <h2>{podcast.episode}</h2>
          <em>by {podcast.name}</em>
          <div className={styles.description}>{podcast.description}</div>
          <div className={styles.btns}>
            <a href={podcast.link} target="_blank">
              <button className={styles["listen-btn"]}>Listen now</button>
            </a>
            <a
              href={`https://testnets.opensea.io/assets/base-goerli/${nftAddress}/${tokens[0]}`}
              target="_blank"
              className={styles.listen}
            >
              View on Opensea
            </a>
          </div>
          <br /> <br />
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default Minter;