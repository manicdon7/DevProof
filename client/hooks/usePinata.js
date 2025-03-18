import { PinataSDK } from "pinata-web3";

const Pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT_TOKEN,
});

export async function useUpload(address, username) {
  try {
    if (!address || !username) {
      throw new Error("Both GitHub and Metamask addresses are required");
    }

    const data = {
      metamask: address,
      github: username,
    };

    const fileBlob = new Blob([JSON.stringify(data)], {
      type: "application/json",
    });

    const formData = new FormData();
    const fileName = `userData_${address}_${username}.json`;
    formData.append("file", fileBlob, fileName);

    formData.append(
      "pinataMetadata",
      JSON.stringify({
        name: fileName,
        keyvalues: {
          metamask: address,
          github: username,
        },
      })
    );

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT_TOKEN}`,
        },
        body: formData,
      }
    );

    const pinataUpload = await response.json();
    console.log("Pinata Upload:", pinataUpload);
    return pinataUpload;
  } catch (error) {
    console.error("Upload Error:", error);
    throw new Error(error);
  }
}

export async function GetPin() {
  try {
    const res = await fetch("https://api.pinata.cloud/data/pinList", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT_TOKEN}`,
      },
    });
    const data = await res.json();
    return data;
  } catch (error) {
    throw new Error(error);
  }
}
