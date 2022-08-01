import { useEffect, useState, useRef } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Paper, Grid, Typography, Box, Zoom, Container, useMediaQuery, Button, Checkbox } from "@material-ui/core";
import CardHeader from "../../components/CardHeader/CardHeader";
import { getStakedInfo, unstakeRace } from "src/context/helper/token-staking";
import { useWallet } from "@solana/wallet-adapter-react";
import "./tokenstake.scss";
import { NotificationManager } from "react-notifications";

function StakedRewardToken({ setLoadingStatus, refreshFlag, updateRefreshFlag }) {
  const smallerScreen = useMediaQuery("(max-width: 650px)");
  const verySmallScreen = useMediaQuery("(max-width: 379px)");
  const { connected, wallet, publicKey } = useWallet();
  const [stakeInfos, setStakeInfos] = useState(0);
  const [flag, setFlag] = useState(true);

  useEffect(() => {
    async function getStakeInfo() {
      if (flag && connected) {
        await fetchStakedInfo();
      }
    }
    getStakeInfo();
  }, [connected, refreshFlag]);

  const fetchStakedInfo = async () => {
    let stakedInfo = await getStakedInfo(publicKey?.toBase58());

    if (stakedInfo && stakedInfo.length > 0) {
      console.log("eagle: ", Number(stakedInfo[0].account.stakeAmount));
      let stakedAmount = Number(stakedInfo[0].account.stakeAmount);
      setStakeInfos(stakedAmount / Math.pow(10, 9));
    } else {
      setStakeInfos(0);
    }
  }

  const onUnStake = async () => {
      setLoadingStatus(true);

    try {
      let res = await unstakeRace();
      if (res.result == "success") {
        NotificationManager.success('Unstaked Successfully');
	      updateRefreshFlag();
      } else {
        NotificationManager.error('Unstaking Failed!');
      }
    } catch (e) {
      NotificationManager.error(e.message);
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
        <Paper className="ohm-card">
          <Box display="flex">
            <CardHeader title="Staked RACE Token" />
          </Box>
          <div className="pool-card-container">
            <Grid container spacing={2} className="data-grid" alignContent="center">
              {stakeInfos}
            </Grid>
            <Grid container spacing={2} className="data-grid" alignContent="center">
              <Grid item className="pool-button-container">
                <Button
                  className="pool-button"
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    onUnStake();
                  }}
                >
                  Unstake
                </Button>
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
    <StakedRewardToken setLoadingStatus={setLoadingStatus} refreshFlag={refreshFlag} updateRefreshFlag={updateRefreshFlag} />
  </QueryClientProvider>
);