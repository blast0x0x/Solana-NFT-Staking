import { useEffect, useState, useRef } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Paper, Grid, Typography, Box, Zoom, Container, useMediaQuery, Button, Checkbox } from "@material-ui/core";
import CardHeader from "../../components/CardHeader/CardHeader";
import { stakeRace, getStakedInfo, getWalletBalance } from "../../context/helper/token-staking";
import { useWallet } from "@solana/wallet-adapter-react";
import "./tokenstake.scss";
import { NotificationManager } from "react-notifications";

function UnstakedRewardToken({ setLoadingStatus, refreshFlag, updateRefreshFlag }) {
  const smallerScreen = useMediaQuery("(max-width: 650px)");
  const verySmallScreen = useMediaQuery("(max-width: 379px)");
  const wallet = useWallet();
  const [tokenBalance, setTokenBalance] = useState(0);

  useEffect(() => {
    async function fetchAll() {
      console.log("Fetching...............")
      if (wallet && wallet.publicKey) {
        await fetchUnstakedInfo()
      }
    }

    fetchAll();
  }, [refreshFlag, wallet.connected])

  const fetchUnstakedInfo = async () => {
    let wallet_balance = await getWalletBalance();
    setTokenBalance(wallet_balance);
  }

  const onStake = async () => {
    setLoadingStatus(true);

    try {
      let res = await stakeRace();
      if (res.result == "success") {
        NotificationManager.success('Transaction succeed');
        updateRefreshFlag();
      } else {
        NotificationManager.error('Transaction failed');
      }
    } catch (err) {
      NotificationManager.error(err.message);
    }

    setLoadingStatus(false);
  };

  return (
    <Container
      style={{
        paddingLeft: smallerScreen || verySmallScreen ? "0" : "2.3rem",
        paddingRight: smallerScreen || verySmallScreen ? "0" : "2.3rem",
      }}
    >
      <Zoom in={true}>
        <Paper className="ohm-card custom-scroll-bar">
          <Box display="flex">
            <CardHeader title="My RACE Token Balance" />
          </Box>
          <div className="token-list-container">
            <Grid container spacing={2} className="data-grid" alignContent="center">
              {tokenBalance}
            </Grid>
            <Grid container spacing={2} className="data-grid" style={{ padding: '10px' }} alignContent="center">
              <Grid item className="stake-button">
                <div className="stake-button-container">
                  <Button
                    // className="stake-button"
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      onStake();
                    }}
                  >
                    Stake
                  </Button>
                </div>
              </Grid>
            </Grid>
          </div>
        </Paper>
      </Zoom>
    </Container >
  );
}

const queryClient = new QueryClient();

export default ({ setLoadingStatus, refreshFlag, updateRefreshFlag }) => (
  <QueryClientProvider client={queryClient}>
    <UnstakedRewardToken setLoadingStatus={setLoadingStatus} refreshFlag={refreshFlag} updateRefreshFlag={updateRefreshFlag} />
  </QueryClientProvider>
);