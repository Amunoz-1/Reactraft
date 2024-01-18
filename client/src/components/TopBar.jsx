import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material';

import SideDrawer from './SideDrawer';
import UserMenu from './functionalButtons/UserMenu';
import DarkModeSwitch from './functionalButtons/DarkModeSwitch';

import { goToPage } from '../utils/reducers/appSlice';
import { resetDesign } from '../utils/reducers/designSliceV2';
import { useAuth } from '../hooks/useAuth';
import {
  AppBarButtonsStyleLight,
  AppBarButtonsStyleDark,
} from '../Styles/ThemeGlobal';

export default function TopBar({ toggleDarkMode, darkMode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dispatch = useDispatch();
  function handlePageClick(page) {
    dispatch(goToPage(page));
    dispatch(resetDesign());
  }
  const { user } = useAuth();
  const theme = useTheme();
  const AppBarButtonsStyle =
    theme.palette.mode === 'dark'
      ? AppBarButtonsStyleDark
      : AppBarButtonsStyleLight;
  return (
    <AppBar display='flex' position='absolute'>
      <Toolbar
        disableGutters={true}
        to
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: 'transparent',
        }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'start',
            alignItems: 'center',
          }}>
          <Button
            variant='contained'
            size='large'
            disableElevation
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={AppBarButtonsStyle}>
            <MenuIcon />
          </Button>
          <SideDrawer drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
          <Typography fontSize='25px'>Reactraft</Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'end',
            alignItems: 'center',
          }}>
<<<<<<< HEAD
          <DarkModeSwitch toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
=======
          <DarkModeSwitch size='xs' toggleDarkMode={toggleDarkMode} />
>>>>>>> feature/component_alignment
          <Button
            variant='contained'
            disableElevation
            onClick={() => handlePageClick('HOME')}
            sx={AppBarButtonsStyle}>
            <HomeIcon />
          </Button>
          <Button
            variant='contained'
            disableElevation
            onClick={() => handlePageClick('NEW_DESIGN')}
            sx={AppBarButtonsStyle}
            startIcon={<AddPhotoAlternateIcon />}>
            New Design
          </Button>
          {user && <UserMenu />}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
