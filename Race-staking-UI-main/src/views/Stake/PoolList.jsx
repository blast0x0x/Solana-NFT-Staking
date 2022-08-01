import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { QueryClient, QueryClientProvider } from "react-query";
import { Paper, Grid, Typography, Box, Zoom, Container, useMediaQuery, Button } from "@material-ui/core";
import { useSelector } from "react-redux";
import CardHeader from "../../components/CardHeader/CardHeader";
import { prettifySeconds } from "../../helpers";

import { useTheme } from "@material-ui/core/styles";
import "./stake.scss";

function PoolList() {
  const smallerScreen = useMediaQuery("(max-width: 650px)");
  const verySmallScreen = useMediaQuery("(max-width: 379px)");
  const dispatch = useDispatch();

  let initialPoolList = [
    {
      id: 0,
      lockDay: 'no lock',
      reward: '10 $PANDA per day',
      totalStaked: 0
    },
    {
      id: 1,
      lockDay: '14 days',
      reward: '15 $PANDA per day',
      totalStaked: 0
    },
    {
      id: 2,
      lockDay: '30 days',
      reward: '25 $PANDA per day',
      totalStaked: 0
    }
  ];
  const [poolList, setPoolList] = useState(initialPoolList);

  const poolInfos = useSelector(state => {
    return state.account.poolInfos;
  })

  useEffect(() => {
    if (poolInfos !== null && poolInfos !== undefined) {
      for (let i = 0; i < poolInfos.lockUpPeriods.length; i++) {
        initialPoolList[i].lockDay = poolInfos.lockUpPeriods[i];
        initialPoolList[i].reward = poolInfos.rewardMultipliers[i];
        // console.log("poolInfos.rewardMultipliers[i]", poolInfos.rewardMultipliers[i]);
        // initialPoolList[i].totalStaked = poolInfos.totalStakeds[i];

      }
      setPoolList(initialPoolList);
    }
  }, [poolInfos]);

  // const tokenIDList = useSelector(state => {
  //   return state.account.nft && state.account.nft.tokenIDList;
  // })

  const PoolItemView = ({ item }) => {
    // console.log("PoolItemView", item);
    return (
      < Grid item lg={4} md={4} sm={6} xs={12} style={{ justifyContent: "center" }} >
        <div className="pool-card">
          <Grid container className="data-grid" alignContent="center">
            <Grid item lg={6} md={6} sm={6} xs={6}>
              <Typography variant="h6" className="nft-item-description-title" align={'left'}>
                Pool ID :
              </Typography>
            </Grid>
            <Grid item lg={6} md={6} sm={6} xs={6}>
              <Typography variant="h6" className="nft-item-description-value" align={'right'}>
                {item.id + 1}
              </Typography>
            </Grid>
          </Grid>
          {/* <Grid container className="data-grid" alignContent="center">
            <Grid item lg={6} md={6} sm={6} xs={6}>
              <Typography variant="h6" className="nft-item-description-title" align={'left'}>
                Total Staked :
              </Typography>
            </Grid>
            <Grid item lg={6} md={6} sm={6} xs={6}>
              <Typography variant="h6" className="nft-item-description-value" align={'right'}>
                {item.totalStaked}
              </Typography>
            </Grid>
          </Grid> */}
          <Grid container className="data-grid" alignContent="center">
            <Grid item lg={6} md={6} sm={6} xs={6}>
              <Typography variant="h6" className="nft-item-description-title" align={'left'}>
                LockDay:
              </Typography>
            </Grid>
            <Grid item lg={6} md={6} sm={6} xs={6}>
              <Typography variant="h6" className="nft-item-description-value" align={'right'}>
                {(item.lockDay) ? initialPoolList[item.id].lockDay : prettifySeconds(item.lockDay)}
              </Typography>
            </Grid>
          </Grid>
          <Grid container className="data-grid" alignContent="center">
            <Grid item lg={6} md={6} sm={6} xs={6}>
              <Typography variant="h6" className="nft-item-description-title" align={'left'}>
                RewardRate:
              </Typography>
            </Grid>
            <Grid item lg={6} md={6} sm={6} xs={6}>
              <Typography variant="h6" className="nft-item-description-value" align={'right'}>
                {item.reward}
              </Typography>
            </Grid>
          </Grid>
        </div>
      </Grid>
    )
  }

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
            <CardHeader title="Pool Info" />
          </Box>
          <div className="pool-card-container">
            <Grid container spacing={2} className="data-grid" alignContent="center">
              {
                (poolList && poolList.length > 0) ?
                  poolList.map(item => {
                    return <PoolItemView item={item} />
                  })
                  :
                  <div>No pools</div>

              }
            </Grid>
          </div>

        </Paper>
      </Zoom>

    </Container >
  );
}

const queryClient = new QueryClient();

export default () => (
  <QueryClientProvider client={queryClient}>
    <PoolList />
  </QueryClientProvider>
);