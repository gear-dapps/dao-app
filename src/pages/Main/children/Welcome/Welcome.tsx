import React, { useState } from 'react';
import { useStatus } from 'hooks';
import { Button } from '@gear-js/ui';
import { Link } from 'react-router-dom';
import { MemberModal } from 'components/MemberModal/MemberModal';
import memberIcon from 'images/member-icon.svg';

import './Welcome.scss';

export const Welcome = () => {
  const {
    userStatus: { isMember, isAdmin },
  } = useStatus();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <header className="welcome">
      <h1>The DAO</h1>
      <p>
        Welcome to the example of DAO (Decentralized Autonomous Organization)<br />
        implementation based on Gear platform.
      </p>

      <div className="btn-line">
        {isMember ? (
          <Link to="/add">
            <Button text="Submit Proposal" className="btn btn-success" />
          </Link>
        ) : (
          <Button
            text="Become a member"
            className="btn btn-success"
            onClick={openModal}
            icon={memberIcon}
          />
        )}
      </div>

      {isModalOpen && <MemberModal closeModal={closeModal} />}
    </header>
  );
};
