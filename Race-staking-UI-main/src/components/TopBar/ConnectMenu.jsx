import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Button, SvgIcon, Typography, Popper, Paper, Divider, Link, Slide, Fade } from "@material-ui/core";
import { NavLink } from "react-router-dom";
import { ReactComponent as ArrowUpIcon } from "../../assets/icons/arrow-up.svg";
import { ReactComponent as CaretDownIcon } from "../../assets/icons/caret-down.svg";
import { useAddress, useWeb3Context } from "src/hooks/web3Context";
import { shorten } from "../../helpers";
import imgConnect from '../../assets/images/img_connect_btn.png';
import imgDisConnect from '../../assets/images/img_disconnect_btn.png';
import imgLogo from '../../assets/images/orbitinu logo.webp';

function ConnectMenu({ theme }) {
  const { connect, disconnect, connected, web3, chainID } = useWeb3Context();
  const address = useAddress();
  const [anchorEl, setAnchorEl] = useState(null);
  const [isConnected, setConnected] = useState(connected);
  const [isHovering, setIsHovering] = useState(false);

  const pendingTransactions = useSelector(state => {
    return state.pendingTransactions;
  });

  let buttonText = "Connect Wallet";
  let clickFunc = connect;

  const handleClick = event => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  if (isConnected) {
    buttonText = "Disconnect";
    clickFunc = disconnect;
  }

  if (pendingTransactions && pendingTransactions.length > 0) {
    buttonText = "In progress";
    clickFunc = handleClick;
  }

  const open = Boolean(anchorEl);
  const id = open ? "ohm-popper-pending" : undefined;

  const primaryColor = theme === "light" ? "#49A1F2" : "#ffe300";
  const buttonStyles =
    "pending-txn-container" + (isHovering && pendingTransactions.length > 0 ? " hovered-button" : "");

  const getEtherscanUrl = txnHash => {
    return chainID === 4 ? "https://rinkeby.etherscan.io/tx/" + txnHash : "https://bscscan.com/tx/" + txnHash;
  };

  useEffect(() => {
    if (address) {
      connect();
    }
  }, [address]);
  useEffect(() => {
    if (pendingTransactions.length === 0) {
      setAnchorEl(null);
    }
  }, [pendingTransactions]);

  useEffect(() => {
    setConnected(connected);
  }, [web3, connected]);

  return (
    <div
      onMouseEnter={e => (pendingTransactions && pendingTransactions.length > 0 ? handleClick(e) : null)}
      onMouseLeave={e => (pendingTransactions && pendingTransactions.length > 0 ? handleClick(e) : null)}
      className="connect-button-container"
    >
      <img src={!isConnected ? imgConnect : imgDisConnect} onClick={clickFunc} className="connect-button" />
      {
        isConnected ?
          <Link href={`https://bscscan.io/address/${address}`} target="_blank">
            {shorten(address)}
          </Link> :
          <></>
      }
    </div>
  );
}

export default ConnectMenu;
