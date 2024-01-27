import React, { Fragment, useState } from 'react';
import TextField from '@mui/material/TextField';
import { useDispatch, useSelector } from 'react-redux';
import { updateDesignCoverOrTitleRequestAndUpdateState } from '../../../utils/reducers/designSliceV3';
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';

export default function InputDesignTitle() {
  const dispatch = useDispatch();
  const design = useSelector((state) => state.designV3);
  const [title, setTitle] = useState(design.title);
  return (
    <Fragment>
      <Box
        component='form'
        sx={{
          '& .MuiTextField-root': { m: '10px', width: '20ch' },
        }}
      >
        <TextField
          variant='filled'
          label='Design Name'
          className='designTitle'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            try {
              dispatch(
                updateDesignCoverOrTitleRequestAndUpdateState({
                  designId: design._id,
                  title,
                })
              );
            } catch (error) {
              dispatch(
                setMessage({
                  severity: 'error',
                  text: 'Design: update title in workspace ' + err,
                })
              );
            }
          }}
          noValidate
          autoComplete='off'
        />
      </Box>
    </Fragment>
  );
}
