import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Navbar() {
  return (
    <div>
      <nav className="flex justify-between p-3 items-center">
        <div>DevProof</div>
        <div>
          <ConnectButton chainStatus="icon" />
        </div>
      </nav>
    </div>
  );
}
