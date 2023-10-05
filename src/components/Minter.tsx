import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "../utils/abi.json";
import { BiconomySmartAccount } from "@biconomy/account";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import styles from "@/styles/Home.module.css";

const nftAddress = "0x7A69ceF86F94717A0a76FFAFF7BD17Dcf9F82f3e";
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
  name: "";
  episode: "";
  description: "";
  image: "";
  link: "";
}

const Minter: React.FC<Props> = ({ smartAccount, address, provider }) => {
  console.log(address, "address");
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
      // mint token with Smart Account

      toast.success(`Success! Here is your transaction:`, {
        position: "top-right",
        autoClose: 18000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } catch (err: any) {
      console.error(err);
      console.log(err);
    }
  };

  // display NFT if minted
  useEffect(() => {
    (async () => {
      if (!address) return;
      const nftContract = new ethers.Contract(nftAddress, abi, jsonProvider);
      tokens = await nftContract.tokensOfOwner(address);
      if (tokens.length >= 1) {
        setMinted(true);
        const tokenUri = await nftContract.tokenURI(tokens[0]);
        const res = await (await fetch(tokenUri)).json();

        // read nft metadata
        const podcast = {
          episode: res.name,
          name: res.attributes["podcast-name"],
          description: res.description,
          image: res.image,
          link: res.attributes["episode-link"],
        };

        setPodcast(podcast);
      }
    })();
  }, [minted]);

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
    </>
  );
};

export default Minter;
