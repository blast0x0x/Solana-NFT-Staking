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
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { useTheme } from "@material-ui/core/styles";
import "./tokenstake.scss";
import { NotificationManager } from "react-notifications";
import { getStakedList } from "src/context/helper/token-staking";

function OrderListByReward({ setLoadingStatus, refreshFlag, updateRefreshFlag }) {
  const theme = useTheme();
  const smallerScreen = useMediaQuery("(max-width: 650px)");
  const verySmallScreen = useMediaQuery("(max-width: 379px)");
  const dispatch = useDispatch();
  // const { connect, address, provider, chainID, connected, hasCachedProvider } = useWeb3Context();
  const staked = useSelector(state => {
    return state.app.Staked;
  });

  const tokenSelectedList = useRef([]);
  const wallet = useWallet();
  const [tokenStakedInfoList, setTokenStakedInfoList] = useState([]);

  useEffect(() => {
    async function fetchAll() {
      console.log("Fetching...............")
      if (wallet && wallet.publicKey) {
        // console.log('fetchFlag:  TRUE')
        await fetchStakedInfo()
      }
    }
    fetchAll();
  }, [refreshFlag, wallet.connected])

  function GetSortOrderJSON(prop) {
    return function (a, b) {
      if (parseInt(a[prop]) < parseInt(b[prop])) {
        return 1;
      } else if (parseInt(a[prop]) > parseInt(b[prop])) {
        return -1;
      }
      return 0;
    }
  }

  const fetchStakedInfo = async () => {
    let data = [{ address: 'abcde', amount: '9' }, { address: 'abcde', amount: '10' }, { address: 'abcde', amount: '21' }]//= await getNftTokenData();
    let stakedInfo = await getStakedList();
    if (stakedInfo && stakedInfo.length > 0) {

      let collection = [];
      for (let i = 0; i < stakedInfo.length; i++) {
        let item = stakedInfo[i];
        collection.push({ address: item.account.owner.toBase58(), amount: Number(item.account.stakeAmount) / Math.pow(10, 9) });
      }

      collection.sort(GetSortOrderJSON("amount"));
      setTokenStakedInfoList(collection);
    }
  }

  const listItems = tokenStakedInfoList?.map((myList) => {
    return <li style={{ marginBottom: '10px' }}>{`${myList.address}, ${myList.amount}`}</li>;
  });

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
            <CardHeader title="RACE Token Staking Order" />
          </Box>
          <div className="token-list-container">
            <menu>{listItems}</menu>
          </div>
        </Paper>
      </Zoom>
    </Container >
  );
}

const queryClient = new QueryClient();

export default ({ setLoadingStatus, refreshFlag, updateRefreshFlag }) => (
  <QueryClientProvider client={queryClient}>
    <OrderListByReward setLoadingStatus={setLoadingStatus} refreshFlag={refreshFlag} updateRefreshFlag={updateRefreshFlag} />
  </QueryClientProvider>
);