import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { QueryClient, QueryClientProvider } from "react-query";
import { Paper, Grid, Typography, Box, Zoom, Container, useMediaQuery, Button } from "@material-ui/core";
import Loading from "../../components/Loading";

import UnstakedRewardToken from "./UnstakedRewardToken";
import StakedRewardToken from "./StakedRewardToken";
import OrderListByReward from "./OrderListByReward";
import "./tokenstake.scss";

function TokenStake() {

  const smallerScreen = useMediaQuery("(max-width: 650px)");
  const verySmallScreen = useMediaQuery("(max-width: 379px)");
  const dispatch = useDispatch();

  const [loadingStatus, setLoadingStatus] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);

  const updateRefreshFlag = () => {
    setRefreshFlag(!refreshFlag);
  }

  return (
    <div id="tokenstake-view" className={`${smallerScreen && "smaller"} ${verySmallScreen && "very-small"}`}>
      <Container
        style={{
          paddingLeft: smallerScreen || verySmallScreen ? "0" : "2.3rem",
          paddingRight: smallerScreen || verySmallScreen ? "0" : "2.3rem",
        }}
      >
      <div style={{display: 'flex'}}>
        <div style={{width: '100%'}}>
          <UnstakedRewardToken setLoadingStatus={setLoadingStatus} refreshFlag={refreshFlag} updateRefreshFlag={updateRefreshFlag} />
          <StakedRewardToken setLoadingStatus={setLoadingStatus} refreshFlag={refreshFlag} updateRefreshFlag={updateRefreshFlag} />
        </div>
        <div style={{width: '100%'}}>
          <OrderListByReward setLoadingStatus={setLoadingStatus} refreshFlag={refreshFlag} updateRefreshFlag={updateRefreshFlag} />
        </div>
      </div>
      </Container >

      <Loading
        open={loadingStatus}
      />
    </div>
  );
}

const queryClient = new QueryClient();

export default () => (
  <QueryClientProvider client={queryClient}>
    <TokenStake />
  </QueryClientProvider>
);