import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { QueryClient, QueryClientProvider } from "react-query";
import { useWeb3Context } from "../../hooks";
import { Paper, Grid, Typography, Box, Zoom, Container, useMediaQuery, Button, Checkbox } from "@material-ui/core";
import { FormControl, RadioGroup, FormControlLabel, Radio } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { useSelector } from "react-redux";
import { trim, formatCurrency } from "../../helpers";
import { stake } from "../../slices/NFT";
import CardHeader from "../../components/CardHeader/CardHeader";
import { PublicKey } from '@solana/web3.js';

import { getNftMetadataURI, getAllNftData } from "../../context/utils";
import { stakeNft, getStakedInfo } from "../../context/helper/nft-staking";
import { NFT_CREATOR } from "../../context/constants";

import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";

import { useTheme } from "@material-ui/core/styles";
import "./stake.scss";

import { NotificationManager } from "react-notifications";

const collection_creator = NFT_CREATOR;

function TokenList({ setLoadingStatus, refreshFlag, updateRefreshFlag }) {
  const theme = useTheme();
  const smallerScreen = useMediaQuery("(max-width: 650px)");
  const verySmallScreen = useMediaQuery("(max-width: 379px)");
  const dispatch = useDispatch();
  // const { connect, address, provider, chainID, connected, hasCachedProvider } = useWeb3Context();
  const staked = useSelector(state => {
    return state.app.Staked;
  });

  const poolID = useRef("0");
  const tokenSelectedList = useRef([]);
  const [fetchFlag, setFetchFlag] = useState(true);
  const wallet = useWallet();

  const [tokenIDList, setTokenIDList] = useState([]);

  // useEffect(() => {
  //   if (tokenIDList !== null && tokenIDList !== undefined) {
  //     tokenSelectedList.current = [];
  //     tokenIDList.map((item, index) => {
  //       tokenSelectedList.current.push({ "id": tokenIDList[index], "selected": false });
  //     })
  //   }
  // }, [tokenIDList]);

  useEffect(() => {
    async function fetchAll() {
      console.log("Fetching...............")
      if (wallet && wallet.publicKey) {
        // console.log('fetchFlag:  TRUE')
        await fetchUnstakedInfo()
      }
    }

    fetchAll();
  }, [refreshFlag, wallet.connected])

  const fetchUnstakedInfo = async () => {
    let data = await getNftTokenData();
    if (data) {
      // let collection = data.filter((item) => item.data.creators &&
      //  (item.data.creators.filter((creator) => creator.verified == 1))[0].address == collection_creator);

      let stakedInfo = await getStakedInfo(wallet.publicKey);

      let collection = [];
      for (let i = 0; i < data.length; i++) {
        let item = data[i];
        if (item.data.creators) {
          let verifiedCreators = item.data.creators.filter((creator) => creator.verified == 1);
          if (verifiedCreators && verifiedCreators.length > 0) {
            if (verifiedCreators[0].address == collection_creator) {
              // check staked nft
              let isStaked = false;
              for (let s_idx = 0; s_idx < stakedInfo.length; s_idx++) {
                if (stakedInfo[s_idx].account.nftAddr.equals(new PublicKey(item.mint))) {
                  isStaked = true;
                  break;
                }
              }
              if (isStaked) {
                continue;
              }

              // get uri
              let uri = await axios.get(item.data.uri);
              collection.push({ mint: item.mint, uri: uri.data });
            }
          }
        }
      }

      tokenSelectedList.current = [];
      collection.map((item, index) => {
        tokenSelectedList.current.push({ "id": collection[index], "selected": false });
      })

      // console.log('result : ', collection);
      setTokenIDList(collection);
    }
  }

  const getNftTokenData = async () => {
    try {
      let nftData = await getAllNftData();
      var data = Object.keys(nftData).map((key) => nftData[key]); let arr = [];
      let n = data.length;
      for (let i = 0; i < n; i++) {
        // // console.log(data[i].data.uri);
        arr.push(data[i]);
      }
      // console.log(`arr`)
      return arr;
    } catch (error) {
      console.log(error);
    }
  };


  const onTokenSeltected = (event, id) => {
    tokenSelectedList.current[id].selected = !tokenSelectedList.current[id].selected;
    // console.log('token selected', tokenSelectedList.current);
  }

  const onStake = async () => {
    setLoadingStatus(true);

    let tokenList = [];
    tokenSelectedList.current.map((item, index) => {
      if (item.selected) {
        tokenList.push(item.id.mint);
      }
    })

    if (tokenList.length != 0) {
      // console.log('onStake', poolID.current);

      try {
        let res = await stakeNft(tokenList);
        if (res.result == "success") {
          NotificationManager.success('Transaction succeed');
          updateRefreshFlag();
        } else {
          NotificationManager.error('Transaction failed');
        }
      } catch (err) {
        NotificationManager.error(err.message);
      }
    }

    setLoadingStatus(false);
  };

  const RowRadioButtonsGroup = () => {
    const [selVal, setSelVal] = useState(poolID.current);

    const onChangePool = (event) => {
      poolID.current = event.target.value;
      setSelVal(event.target.value);
    };

    return (
      <FormControl>
        <RadioGroup
          row
          aria-labelledby="demo-row-radio-buttons-group-label"
          name="row-radio-buttons-group"
          value={selVal}
          onChange={onChangePool}
        >
          <FormControlLabel value="0" control={<Radio />} label="Pool 1" />
          <FormControlLabel value="1" control={<Radio />} label="Pool 2" />
          <FormControlLabel value="2" control={<Radio />} label="Pool 3" />
          {/* <FormControlLabel value="5" control={<Radio />} label="Pool 6" /> */}

        </RadioGroup>
      </FormControl>
    );
  }

  const NFTItemView = ({ nft_item, index }) => {
    const [checked, setChecked] = useState(false);
    const onSelect = (e) => {
      setChecked(checked => !checked);
      onTokenSeltected(e, index);
    }

    return (
      <Grid item lg={3}>
        <div className="pool-card" onClick={e => onSelect(e)}>
          <Grid container className="data-grid" alignContent="center">
            <Grid item lg={9}  >
              <Typography variant="h6" >
                {nft_item.uri.name}
              </Typography>
            </Grid>
            <Grid item lg={3} style={{ display: "flex", justifyContent: "center" }}>
              <Checkbox style={{ marginTop: '-10px' }}
                checked={tokenSelectedList.current && tokenSelectedList.current[index] ? tokenSelectedList.current[index].selected : false} />
            </Grid>
          </Grid>

          <Grid container className="data-grid" alignContent="center">
            <img src={nft_item.uri.image} className="nft-list-item-image" width={"100%"} />
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
        <Paper className="ohm-card custom-scroll-bar">
          <Box display="flex">
            <CardHeader title="My NFT List" />
          </Box>
          <div className="token-list-container">
            <Grid container spacing={2} className="data-grid" alignContent="center">
              {
                (tokenIDList && tokenIDList.length > 0) ?
                  tokenIDList.map((item, index) => {
                    return <NFTItemView nft_item={item} index={index} />
                  })
                  :
                  <div style={{ padding: '15px', fontSize: '30px' }}>No NFT</div>

              }
            </Grid>
            {/* <div style={{ display: "flex", justifyContent: "center" }}>
              <RowRadioButtonsGroup />
            </div> */}
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
    <TokenList setLoadingStatus={setLoadingStatus} refreshFlag={refreshFlag} updateRefreshFlag={updateRefreshFlag} />
  </QueryClientProvider>
);