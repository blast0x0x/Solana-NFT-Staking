import { AppBar, Avatar, Toolbar, IconButton, Box, Button, SvgIcon, Menu, MenuItem } from "@material-ui/core";
import { useCallback, useState } from "react";
import { Paper, Link, Typography } from "@material-ui/core";
import { NavLink } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";

import { WalletConnect } from "../wallet";

import "./topbar.scss";
const useStyles = makeStyles(theme => ({
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: "100%",
      padding: "40px",
    },
    //    justifyContent: "center",
    //    alignItems: "flex-end",
    background: "#0001",
    backdropFilter: "none",
    zIndex: 10,
  },

  menuBar: {
    display: "flex",
    alignItems: "center",
    marginLeft: "33px",

  },

  menuItem: {
    paddingLeft: "20px",
    paddingRight: "20px",
    alignItems: "center",
  },
  svg: {
    width: "20px",
    height: "20px",
    marginRight: "12px",
    alignItems: "center",
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("981")]: {
      display: "block",
    },

  },
}));


function TopBar({ theme, toggleTheme, handleDrawerToggle }) {
  const classes = useStyles();
  const isVerySmallScreen = useMediaQuery("(max-width: 355px)");
  const [isActive] = useState();

  const checkPage = useCallback((match, location, page) => {
    const currentPath = location.pathname.replace("/", "");
    if (currentPath.indexOf("dashboard") >= 0 && page === "dashboard") {
      return true;
    }

    return false;
  }, []);
  // return <MenuBar/>
  return (
    <AppBar position="static" className={classes.appBar} elevation={0}>
      <Toolbar disableGutters className="dapp-topbar">
        <div style={{ width: "200px" }}></div>
        <Box display="flex">
          {/* <Logo theme={theme} /> */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'flex' } }}>
            <div className={classes.menuBar}>
              {/* <div className={classes.menuItem}>
                <Link
                  component={NavLink}
                  id="mint-nav"
                  to="/mint"
                  isActive={(match, location) => {
                    return checkPage(match, location, "mint");
                  }}
                  className={`button-dapp-menu ${isActive ? "active" : ""}`}
                >
                  <Typography variant="h5">
                    Mint
                  </Typography>
                </Link>
              </div> */}
              <div className={classes.menuItem}>
                <Link
                  component={NavLink}
                  id="stake-nav"
                  to="/stake"
                  isActive={(match, location) => {
                    return checkPage(match, location, "stake");
                  }}
                  className={`button-dapp-menu ${isActive ? "active" : ""}`}
                >
                  <Typography variant="h2">
                    NFT Staking
                  </Typography>
                </Link>
              </div>
              {<div className={classes.menuItem}>
                <Link
                  component={NavLink}
                  id="tokenstake-nav"
                  to="/tokenstake"
                  isActive={(match, location) => {
                    return checkPage(match, location, "tokenstake");
                  }}
                  className={`button-dapp-menu ${isActive ? "active" : ""}`}
                >
                  <Typography variant="h2">
                    RACE Token Staking
                  </Typography>
                </Link>
              </div>}
            </div>
          </Box>
          {/* <ConnectMenu theme={theme} /> */}

        </Box>
        <WalletConnect />

      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
