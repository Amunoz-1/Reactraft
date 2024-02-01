import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import PastDesigns from './PastDesigns';
import { Container } from '@mui/material';
import HomePageSearch from './HomePageSearch';
import Box from '@mui/material/Box';

export default function Home() {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');
  if (user)
    return (
      <Box width='1300px' display='flex' maxWidth='1300px'>
        <Container disableGutters={true}>
          {/* conditional rendering of HomPageSearch. if a design is selected, the search bar will not appear in the workspace */}
          <HomePageSearch
            searchText={searchText}
            setSearchText={setSearchText}
          />
          <PastDesigns searchText={searchText} />
        </Container>
      </Box>
    );
}
