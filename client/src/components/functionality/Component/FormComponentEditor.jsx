import React, { Fragment, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Divider, Typography, IconButton } from '@mui/material';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Autocomplete from '@mui/material/Autocomplete';
import Popper from '@mui/material/Popper';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

import { setMessage } from '../../../utils/reducers/appSlice';
import isValidVariableName from '../../../utils/isValidVariableName';
import { convertArrToObj } from '../../../utils/convertBetweenObjArr';
import { submitComponentForm } from '../../../utils/reducers/designSliceV3';

import SelectorParent from './SelectorParent';
import SelectorHtmlTag from './SelectorHtmlTag';

const boxStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: '#f4f3f7',
  color: '#2c2c2c',
  // border: '2px solid #000',
  borderRadius: '2px',
  boxShadow: '3px 5px 5px -3px rgba(44, 44, 44, 1);',
  p: 4,
};

export default function FormComponentEditor({
  idx,
  open,
  closeEditor,
  isLeaf,
}) {
  const dispatch = useDispatch();
  const { pages } = useSelector((state) => state.designV3);
  const { selectedPageIdx } = useSelector((state) => state.app);
  const component = pages[selectedPageIdx].components[idx];

  const [props, setProps] = useState(component.props);
  const [styles, setStyles] = useState(component.styles);

  const deleteMessage = isLeaf
    ? {
        severity: 'success',
        text: 'Successfully removed a component ' + component.name,
      }
    : {
        severity: 'error',
        text: `Component ${component.name} has children. Failed to remove`,
      };

  function handleSumbit(e) {
    e.preventDefault();
    const body = {
      name: e.target.name.value,
      htmlTag: isLeaf ? e.target.htmlTag.value : '',
      innerHtml: isLeaf ? e.target.innerHtml.value : '',
      styles: convertArrToObj(styles),
      props: convertArrToObj(props),
      pageIdx: selectedPageIdx,
    };
    if (isValidVariableName(body.name)) {
      try {
        dispatch(submitComponentForm({ componentId: component._id, body }));
        setMessage({ severity: 'success', text: 'Saved successfully.' });
        closeEditor();
      } catch (err) {
        setMessage({
          severity: 'error',
          text: 'Design: update component: ' + err,
        });
      }
    } else {
      dispatch(
        setMessage({
          severity: 'error',
          text: 'React component name must start with an uppercase letter.',
        })
      );
    }
  }

  return (
    <Modal
      sx={{
        background: '415a77',
      }}
      open={open}
      onClose={closeEditor}>
      <Box
        component='form'
        className='componentEditor'
        sx={boxStyle}
        display='grid'
        gridTemplateColumns='repeat(12, 1fr)'
        gap={2}
        onSubmit={handleSumbit}>
        <NameAndParent idx={idx} name={component.name} />

        {isLeaf && (
          <HtmlData
            idx={idx}
            isLeaf={isLeaf}
            innerHtml={component.inner_html}
          />
        )}

        <Box gridColumn='span 12'>
          <Divider />
        </Box>

        <AddData data={props} setData={setProps} dataName={'Props'} />
        <AddData data={styles} setData={setStyles} dataName={'Styles'} />

        <Box gridColumn='span 4'>
          {idx > 0 && (
            <Button
              variant='outlined'
              color='error'
              onClick={() => {
                if (isLeaf) {
                  disp;
                  closeEditor();
                }
                dispatch(setMessage(deleteMessage));
              }}>
              Delete
            </Button>
          )}
        </Box>

        <Box gridColumn='span 4'>
          <Button color='primary' variant='contained' onClick={closeEditor}>
            Cancel
          </Button>
        </Box>

        <Box gridColumn='span 4'>
          <Button variant='contained' color='success' type='submit'>
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

function NameAndParent({ idx, name }) {
  const [nameVal, setNameVal] = useState(name);
  return (
    <Fragment>
      <Box gridColumn='span 6'>
        <TextField
          size='small'
          required
          label='name'
          name='name'
          value={nameVal}
          disabled={idx === 0}
          onChange={(e) => setNameVal(e.target.value)}
        />
      </Box>
      <Box gridColumn='span 6'>
        <SelectorParent size='small' childIdx={idx} />
      </Box>
    </Fragment>
  );
}

function HtmlData({ idx, isLeaf, innerHtml }) {
  const [innerHtmlVal, setInnerHtmlVal] = useState(innerHtml);
  return (
    <Fragment>
      <Box gridColumn='span 2'>
        <SelectorHtmlTag idx={idx} isLeaf={isLeaf} />
      </Box>
      <Box gridColumn='span 10' sx={{ height: '80%' }}>
        <TextField
          label='inner_html'
          name='innerHtml'
          sx={{ width: '100%' }}
          value={innerHtmlVal}
          onChange={(e) => setInnerHtmlVal(e.target.value)}
        />
      </Box>
    </Fragment>
  );
}

function AddData({ data, setData, dataName }) {
  const keys = data.map((item) => item.key);
  const title =
    dataName === 'Props'
      ? 'You can specify your component props in key-value pairs. '
      : 'You can specify some basic html in key-value pairs.';

  return (
    <Fragment>
      <Typography variant='h5'>{dataName}</Typography>
      <Box gridColumn='span 12' display='flex'>
        <Tooltip title={title}>
          <Typography variant='h6' sx={{ mr: 2 }}>
            Add {dataName}
          </Typography>
        </Tooltip>

        <IconButton
          onClick={() =>
            setData([
              ...data,
              {
                key:
                  dataName.toLowerCase().slice(0, dataName.length - 1) +
                  (data.length + 1),
                value: '',
              },
            ])
          }>
          <AddCircleIcon label='plusIcon' color='#415a77' />{' '}
          {/* changes the color of the '+' in
          Props & Styles*/}
        </IconButton>
      </Box>
      {data.map((item, idx) => (
        <Fragment key={idx}>
          <Box gridColumn='span 5'>
            {dataName === 'Props' ? (
              <PropsTextField
                idx={idx}
                item={item}
                setData={setData}
                keys={keys}
                data={data}
              />
            ) : (
              <StylesAutocomplete
                idx={idx}
                item={item}
                setData={setData}
                keys={keys}
                data={data}
              />
            )}
          </Box>
          <Box gridColumn='span 5' sx={{ alignSelf: 'center' }}>
            <TextField
              label='value'
              id={`value${idx}`}
              name={`${dataName.toLowerCase()}-${item.key}-value`}
              value={item.value}
              onChange={(e) =>
                setData(
                  data.map((el, i) =>
                    i === idx ? { ...el, value: e.target.value } : el
                  )
                )
              }
            />
          </Box>
          <Box gridColumn='span 2'>
            <IconButton
              onClick={() => {
                setData(data.filter((_, i) => i !== idx));
              }}>
              <RemoveCircleIcon />
            </IconButton>
          </Box>
        </Fragment>
      ))}
      <Box gridColumn='span 12'>
        <Divider />
      </Box>
    </Fragment>
  );
}

function PropsTextField({ idx, item, setData, keys, data }) {
  const dispatch = useDispatch();
  return (
    <TextField
      required
      label='key'
      id={`key${idx}`}
      name={`props-${item.key}-key`}
      value={item.key}
      onChange={(e) => {
        const duplicateErr = {
          severity: 'error',
          text: `Invalid prop key: ${e.target.value} has already been declared.`,
        };
        const invalidErr = {
          severity: 'error',
          text: `Invalid prop key: ${e.target.value} is not a valid Javascript variable name.`,
        };
        const emptyErr = {
          severity: 'error',
          text: `Props key cannot be empty.`,
        };
        let message;
        if (e.target.value.length > 0 && keys.includes(e.target.value))
          message = duplicateErr;
        else if (
          !isValidVariableName(e.target.value) &&
          e.target.value.length > 0
        )
          message = invalidErr;
        else if (e.target.value.length === 0) message = emptyErr;
        else {
          setData(
            data.map((el, i) =>
              i === idx ? { ...el, key: e.target.value } : el
            )
          );
        }

        dispatch(setMessage(message));
      }}
    />
  );
}

const basicCssProperties = [
  'border',
  'border-style',
  'color',
  'font-size',
  'font-style',
  'font-weight',
  'line-height',
  'padding',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'padding-top',
  'text-align',
  'text-decoration',
  'text-transform',
  'word-spacing',
  'letter-spacing',
  'overflow',
  'box-shadow',
  'text-shadow',
  'cursor',
];

function StylesAutocomplete({ idx, item, setData, keys, data }) {
  const [value, setValue] = useState(
    item.key.slice(0, 5) === 'style' ? null : item.key
  );
  const [inputValue, setInputValue] = useState('');

  const [anchorEl, setAnchorEl] = useState(null);
  const inputRef = useRef();

  return (
    <Fragment>
      <Autocomplete
        value={value}
        onChange={(e, newValue) => {
          if (!newValue || newValue.length === 0) {
            setValue(item.key);
          } else {
            setValue(newValue);
            setData(
              data.map((el, i) => (i === idx ? { ...el, key: newValue } : el))
            );
            if (newValue.slice(0, 6) === 'border' && inputRef.current) {
              setAnchorEl(inputRef.current);
              setTimeout(() => setAnchorEl(null), 2000);
            } else setAnchorEl(null);
          }
        }}
        inputValue={inputValue}
        onInputChange={(e, newInputValue) => {
          setInputValue(newInputValue);
        }}
        options={basicCssProperties}
        renderInput={(params) => (
          <TextField {...params} label='Common CSS' inputRef={inputRef} />
        )}
      />
      <Popper
        open={Boolean(anchorEl)}
        placement='bottom'
        anchorEl={anchorEl}
        sx={{ zIndex: 10000, color: '#415a77', backgroundColor: '#bdbbb6' }}>
        <Typography>
          Note: setting border-related styles here might not {'\n'}be reflected
          in the component rectangle
        </Typography>
      </Popper>
    </Fragment>
  );
}
