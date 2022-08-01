import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAddress, useWeb3Context } from "src/hooks/web3Context";
import imgLogo from '../../assets/images/orbitinu logo.webp';

function Logo({ theme }) {
  const { connect, disconnect, connected, web3, chainID } = useWeb3Context();
  const address = useAddress();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isConnected, setConnected] = useState(connected);
  const [isHovering, setIsHovering] = useState(false);

  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });


  const handleClick = event => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  if (isConnected) {
    // buttonText = "Disconnect";
    //clickFunc = disconnect;
  }

  if (pendingTransactions && pendingTransactions.length > 0) {
    // buttonText = "In progress";
    // clickFunc = handleClick;
  }

  return (
    <div
      className="connect-button-container"
    >
      <img src={imgLogo} className="logo-image" />
    </div>
  );
}

export default Logo;
