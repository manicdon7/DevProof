import { ethers } from "ethers";

export default async function () {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    return await provider.getSigner();
  } catch (error) {
    throw new Error(error);
  }
}
