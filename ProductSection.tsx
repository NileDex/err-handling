import "./css/ProductSection.css";
import { useRef, useState, useEffect } from "react";
import { useWallet, InputTransactionData } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { ONCHAIN_BIO } from "./constant";

// Configure with Movement Labs testnet URL
const aptosConfig = new AptosConfig({
  network: Network.CUSTOM,
  fullnode: "https://testnet.bardock.movementnetwork.xyz/v1",
});

const aptos = new Aptos(aptosConfig);
const ProductSection = () => {
  const { signAndSubmitTransaction, account } = useWallet();
  const name = useRef<HTMLInputElement>(null);
  const logo = useRef<HTMLInputElement>(null);
  const banner = useRef<HTMLInputElement>(null);
  const description = useRef<HTMLTextAreaElement>(null);
  const weblink = useRef<HTMLInputElement>(null);

  const [currentName, setCurrentName] = useState<string | null>(null);
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  const [currentBanner, setCurrentBanner] = useState<string | null>(null);
  const [currentDescription, setCurrentDescription] = useState<string | null>(null);
  const [currentWeblink, setCurrentWeblink] = useState<string | null>(null);

  const fetchBio = async () => {
    if (!account) {
      console.log("No account connected.");
      return;
    }

    try {
      const bioResource = await aptos.getAccountResource({
        accountAddress: account.address,
        resourceType: `${ONCHAIN_BIO}::onchain_bio::Bio`
      });

      console.log("Fetched Bio Data:", bioResource);

      if (bioResource?.data) {
        setCurrentName(bioResource.data.name || null);
        setCurrentLogo(bioResource.data.logo || null);
        setCurrentBanner(bioResource.data.banner || null);
        setCurrentDescription(bioResource.data.description || null);
        setCurrentWeblink(bioResource.data.weblink || null);
      } else {
        console.log("No bio found.");
      }
    } catch (e) {
      console.error("Error fetching bio:", e);
    }
  };

  useEffect(() => {
    if (account) {
      fetchBio(); // Auto-fetch bio when the account is available
    }
  }, [account]);

  async function registerBio() {
    if (
      name.current !== null &&
      logo.current !== null &&
      banner.current !== null &&
      description.current !== null &&
      weblink.current !== null
    ) {
      const onchainName = name.current.value;
      const onchainLogo = logo.current.value;
      const onchainBanner = banner.current.value;
      const onchainDescription = description.current.value;
      const onchainWeblink = weblink.current.value;

      const transaction: InputTransactionData = {
        data: {
          function: `${ONCHAIN_BIO}::onchain_bio::register`,
          functionArguments: [
            onchainName,
            onchainLogo,
            onchainBanner,
            onchainDescription,
            onchainWeblink,
          ],
        },
      };

      try {
        // Sign and submit transaction
        const response = await signAndSubmitTransaction(transaction);
        console.log(
          `Success! View your transaction at https://explorer.movementlabs.xyz/txn/${response.hash}`
        );
        // Wait for transaction to complete and then fetch the updated bio
        await aptos.waitForTransaction({ transactionHash: response.hash });
        await fetchBio(); // Fetch updated bio after transaction success
      } catch (error: any) {
        console.log("Error submitting transaction:", error);
      }
    }
  }

  return (
    <section className="product-section">
      <div className="container">
        <div className="product-header">
          <h2 className="product-title">Our Featured Items</h2>
          <p className="product-description">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Purus
            faucibus massa dignissim tempus.
          </p>

          <div className="row">
            <h3>Your Name:</h3>
          </div>
          <div className="row">
            <input ref={name} type="text" className="name" placeholder="Enter your name" />
          </div>

          <div className="row">
            <h3>Your Logo URL:</h3>
          </div>
          <div className="row">
            <input ref={logo} type="text" className="logo" placeholder="Enter logo URL" />
          </div>

          <div className="row">
            <h3>Your Banner URL:</h3>
          </div>
          <div className="row">
            <input ref={banner} type="text" className="banner" placeholder="Enter banner URL" />
          </div>

          <div className="row">
            <h3>Your Description:</h3>
          </div>
          <div className="row">
            <textarea ref={description} className="description" placeholder="Your description" />
          </div>

          <div className="row">
            <h3>Your Website Link:</h3>
          </div>
          <div className="row">
            <input ref={weblink} type="text" className="weblink" placeholder="Enter website URL" />
          </div>

          <div className="row">
            <button onClick={registerBio}>Register Bio</button>
          </div>
        </div>

        <div className="product-grid">
          <div className="product-card">
            <div className="product-image-container">
              {currentBanner && (
                <img className="product-image" src={currentBanner} alt="Banner" />
              )}
            </div>
            {currentLogo && <img src={currentLogo} alt="Profile Logo" className="profile-logo" />}
            <div className="product-info">
              <h3>Your Name:</h3>
              <p>{currentName || "No Name Available"}</p>
              <h3>Your Description:</h3>
              <p>{currentDescription || "No Description Available"}</p>
              <h3>Your Website:</h3>
              {currentWeblink ? (
                <a href={currentWeblink} target="_blank" rel="noopener noreferrer">
                  {currentWeblink}
                </a>
              ) : (
                <p>No Website Available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
