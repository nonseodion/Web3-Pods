import { useEffect, useState } from "react";
import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { ethers } from "ethers";
// import Minter from "../components/Minter";
import { ToastContainer } from "react-toastify";

export default function Home() {
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // set user data if logged in
  useEffect(() => {
    (async () => {
      try {
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  const connect = async () => {
    try {
      setLoading(true);

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
          <div>
            <h1>Web3Pods</h1>
            {!address && <p>Login to mint a pod.</p>}
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
            {/* {smartAccount && provider && (
              <Minter
                smartAccount={smartAccount}
                address={address}
                provider={provider}
              />
            )} */}
          </div>
        </div>
        <footer className={styles.footer}>
          <div>
            Made with malice 😈 by{" "}
            <a href="https://twitter.com/nonseodion">nonseodion</a>.
          </div>
          <div className={styles.source}>
            <a href="https://github.com/nonseodion/web3-pods" target="_blank">
              Source code
            </a>
            &nbsp; &nbsp;
            <a
              href="https://docs.google.com/presentation/d/1ydeQiLbDpaoG0eOhzuOsQZhVryRUU8cdMQbK3dki5Lg/edit?usp=sharing"
              target="_blank"
            >
              Slides
            </a>
          </div>
        </footer>

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
      </main>
    </>
  );
}
