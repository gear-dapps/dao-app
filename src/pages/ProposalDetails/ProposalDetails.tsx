import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner } from 'components/Spinner/Spinner';
import { ProposalItems } from './ProposalItems/ProposalItems';
import { ProposalStatus } from 'components/ProposalStatus/ProposalStatus';
import { Title } from './Title/Title';
import { BackButton } from 'components/BackButton/BackButton';
import { ContractResponse, ProposalInfo } from 'pages/types';
import { DAO_CONTRACT_ADDRESS } from 'consts';
import { useApi } from 'hooks';

import daoMeta from 'out/dao.meta.wasm';
import './ProposalDetails.scss';

const ProposalDetails = () => {
  const { api } = useApi();
  const { ProposalId } = useParams();

  const [proposal, setProposal] = useState<ProposalInfo | null>(null);

  useEffect(() => {
    fetch(daoMeta)
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) => Buffer.from(arrayBuffer))
      .then((buffer) =>
        api.programState.read(DAO_CONTRACT_ADDRESS, buffer, {
          ProposalInfo: `${ProposalId}`,
        }),
      )
      .then((state) => state.toHuman() as ContractResponse)
      .then(({ ProposalInfo }) => setProposal(ProposalInfo));
  }, [ProposalId]);

  return (
    <>
      {proposal ? (
        <>
          <div className="proposal-header">
            <BackButton />
            <Title proposalId={ProposalId} />
            <ProposalStatus proposal={proposal} />
          </div>

          <ProposalItems proposal={proposal} />
        </>
      ) : (
        <Spinner />
      )}
    </>
  );
};

export { ProposalDetails };
