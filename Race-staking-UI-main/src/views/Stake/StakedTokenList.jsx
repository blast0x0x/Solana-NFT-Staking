import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { QueryClient, QueryClientProvider } from "react-query";
import { Paper, Grid, Typography, Box, Zoom, Container, useMediaQuery, Button, Checkbox } from "@material-ui/core";

import { unstake, emergencyWithdrawal } from "../../slices/NFT";
import CardHeader from "../../components/CardHeader/CardHeader";
import { prettyVestingPeriod2 } from "../../helpers";
import { error, info } from "../../slices/MessagesSlice";

import "./stake.scss";

import { useWallet } from "@solana/wallet-adapter-react";
import { claimReward, getStakedInfo, unstakeNft } from "src/context/helper/nft-staking";
import { getNftMetadataURI } from "src/context/utils";
import { CLASS_TYPES, LOCK_DAY, SECONDS_PER_DAY } from "src/context/constants";
import UnstakeTimer from "src/components/unstakeTimer/unstakeTimer"
import { NotificationManager } from "react-notifications";
import useRefresh from 'src/hooks/useRefresh'

function StakedTokenList({ setLoadingStatus, refreshFlag, updateRefreshFlag }) {
  const smallerScreen = useMediaQuery("(max-width: 650px)");
  const verySmallScreen = useMediaQuery("(max-width: 379px)");
  const dispatch = useDispatch();

  const { connected, wallet, publicKey } = useWallet();

  const [tokenChecked, setTokenChecked] = useState([]);
  const tokenSelectedList = useRef([]);
  const [stakeInfos, setStakeInfos] = useState([]);
  // const [remainTimes, setRemainTimes] = useState([]);
  const [vault_items, setVault_items] = useState([]);
  const [flag, setFlag] = useState(true);
  const { fastRefresh } = useRefresh();
  // const setLoading = props.setLoading;

  const fetchStakedInfo = async () => {
    console.log("eagle: ", publicKey);
    let stakedInfo = await getStakedInfo(publicKey?.toBase58());
    let arr = [];
    for (let i = 0; i < stakedInfo.length; i++) {
      let uri = await getNftMetadataURI(stakedInfo[i].account.nftAddr);

      let currentTimeStamp = new Date().getTime() / 1000;
      let reward = CLASS_TYPES[stakedInfo[i].account.classId] * (currentTimeStamp - stakedInfo[i].account.lastUpdateTime) / (SECONDS_PER_DAY * 365);
      // console.log("#############################", reward);
      if (reward < 0) reward = 0;

      arr.push({
        id: stakedInfo[i].account.nftAddr.toBase58(),
        uri: uri.image,
        reward: reward,
        name: uri.name,
        classId: stakedInfo[i].account.classId,
        lastUpdateTime: stakedInfo[i].account.lastUpdateTime,
        stakeTime: stakedInfo[i].account.stakeTime,
      });
    }
    setStakeInfos(arr);
    // console.log("[] => update stakeinfos ......",);
  }

  useEffect(() => {
    async function getStakeInfo() {
      if (flag && connected) {
        await fetchStakedInfo();
        // setFlag(false);
      }
    }

    getStakeInfo();
  }, [connected, refreshFlag]);

  useEffect(() => {
    if (stakeInfos !== null && stakeInfos !== undefined) {
      tokenSelectedList.current = [];
      stakeInfos.map((item) => {
        tokenSelectedList.current.push({ "id": item.id, "selected": false });
        tokenChecked.push(false);
      })
    }
  }, [stakeInfos]);

  const onTokenSeltected = (event, id) => {
    tokenSelectedList.current[id].selected = !tokenSelectedList.current[id].selected;
    // tokenChecked[id] = event.target.checked;
    // setTokenChecked([...tokenChecked]);
    // console.log(tokenSelectedList.current);
  }

  const onClaim = async () => {
    setLoadingStatus(true);

    try {
      let res = await claimReward(stakeInfos);
      if (res.result == "success") {
        NotificationManager.success('Claimed Successfully');
        // dispatch(info("Unstaking Successfully!"));
      } else {
        NotificationManager.error('Claim Failed!');
        // dispatch(error("Unstaking Failed!"));
      }
      updateRefreshFlag();
    } catch (e) {
      console.log(e);
      NotificationManager.error(e.message);
    }
    setLoadingStatus(false);
  }

  const onUnStake = async action => {
    let tokenList = [];
    let poolList = [];

    tokenSelectedList.current.map((item, index) => {
      if (item.selected) {
        tokenList.push(item.id);
      }
    })

    if (tokenList.length < 0) return;

    try {
      setLoadingStatus(true);
      let res = await unstakeNft(tokenList);
      setLoadingStatus(false);
      if (res.result == "success") {
        NotificationManager.success('Unstaked Successfully');
      } else {
        NotificationManager.error('Unstaking Failed!');
      }
      updateRefreshFlag();
    } catch (e) {
      console.log("[] => unstaking error: ", e);
      NotificationManager.error(e.message);
      setLoadingStatus(false);
    }

    // setLoading(false);
    // await dispatch(unstake({ tokenList, provider, address, networkID: chainID }));
  };

  const onEmergencyWithdrawal = async action => {
    let tokenList = [];
    let poolList = [];

    tokenSelectedList.current.map((item, index) => {
      if (item.selected) {
        tokenList.push(item.id);
      }
    })
  }


  const NFTItemView = ({ item, index }) => {
    const [checked, setChecked] = useState(false);
    useEffect(() => {
      setChecked(false);
    }, [item, fastRefresh]);

    const onSelect = (e) => {
      setChecked(checked => !checked);
      onTokenSeltected(e, index);
    }

    // console.log("NFTItemView", item);
    let unstakeTime = Number(item.stakeTime) + Number(LOCK_DAY[item.classId] * SECONDS_PER_DAY);
    return (
      <Grid item lg={3}>
        <div className="pool-card" onClick={e => onSelect(e)}>
          <Grid container className="data-grid" alignContent="center">
            <Grid item lg={9}  >
              <Typography variant="h6" >
                {item.name.toString()}
              </Typography>
            </Grid>
            <Grid item lg={3} style={{ display: "flex", justifyContent: "center" }}>
              <Checkbox style={{ marginTop: '-10px' }}
                checked={tokenSelectedList.current && tokenSelectedList.current[index] ? tokenSelectedList.current[index].selected : false} />
            </Grid>
          </Grid>

          <Grid container className="data-grid" alignContent="center">
            <img src={item?.uri} className="nft-list-item-image" width={"100%"} />
          </Grid>
          {/* <Grid container className="data-grid" alignContent="center">
             <Grid item lg={6} md={6} sm={6} xs={6}>
              <Typography variant="h6" className="nft-item-description-title" align={'left'}>
                PoolId:
              </Typography>
            </Grid>
            <Grid item lg={6} md={6} sm={6} xs={6}>
              <Typography variant="h6" className="nft-item-description-value" align={'right'}>
                {item.classId + 1}
              </Typography>
            </Grid>
          </Grid> */}
          <Grid container className="data-grid" alignContent="center">
            <Grid item lg={6} md={6} sm={6} xs={6}>
              <Typography variant="h6" className="nft-item-description-title" align={'left'}>
                Reward:
              </Typography>
            </Grid>
            <Grid item lg={6} md={6} sm={6} xs={6}>
              <Typography variant="h6" className="nft-item-description-value" align={'right'}>
                {Number(item.reward).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
          { /*<Grid container className="data-grid" alignContent="center">
            <Grid item lg={12} md={8} sm={8} xs={8}>
              <Typography variant="h6" className="nft-item-description-value" align={'center'}>
                (item.stakeType == 0) ? "No lockup" : prettyVestingPeriod2(item.depositTime)
                {remainTimes[index]}
                <UnstakeTimer unstakeTime={unstakeTime} />
              </Typography>
            </Grid>
            <Grid item lg={12} md={4} sm={4} xs={4}>
              <Typography variant="h6" className="nft-item-description-title" align={'center'}>
                (Remain Lock Time)
              </Typography>
            </Grid>
          </Grid> */ }
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
            <CardHeader title="Staked NFT List" />
          </Box>
          <div className="pool-card-container">
            <Grid container spacing={2} className="data-grid" alignContent="center">
              {
                (stakeInfos && stakeInfos.length > 0) ?
                  stakeInfos.map((item, index) => {
                    return <NFTItemView item={item} index={index} />
                  })
                  :
                  <div style={{ padding: '15px', fontSize: '30px' }}>No NFT</div>

              }
            </Grid>
            <Grid container spacing={2} className="data-grid" alignContent="center">
              <Grid item className="pool-button-container">
                <Button
                  className="pool-button"
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    onClaim();
                  }}
                >
                  Claim
                </Button>
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
                {/* <Button
                  className="pool-button"
                  variant="contained"
                  color="primary"
                  style={{ color: 'white', background: 'red', marginLeft: '20px' }}
                  onClick={() => {
                    onEmergencyWithdrawal();
                  }}
                >
                  Emergency Withdrawal
                </Button> */}
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
    <StakedTokenList setLoadingStatus={setLoadingStatus} refreshFlag={refreshFlag} updateRefreshFlag={updateRefreshFlag} />
  </QueryClientProvider>
);