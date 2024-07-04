import { useFormik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import { savePreferences } from 'providers/ReduxStore/slices/app';
import StyledWrapper from './StyledWrapper';
import * as Yup from 'yup';
import get from 'lodash/get';
import React from 'react';
import { useTheme } from 'providers/Theme';
import ThemeSelects from 'components/Preferences/Interface/ThemeSelects';

const interfacePrefsSchema = Yup.object().shape({
  hideTabs: Yup.boolean().default(false),
  font: Yup.object({
    codeFont: Yup.string().default('default')
  }),
  theme: Yup.string().oneOf(['light', 'dark', 'system']).required('Theme is required')
});

const Interface = ({ close }) => {
  const { storedTheme, setStoredTheme } = useTheme();
  const dispatch = useDispatch();
  const preferences = useSelector((state) => state.app.preferences);

  const handleSave = (values) => {
    setStoredTheme(values.theme);
    delete values.theme;

    dispatch(
      savePreferences({
        ...preferences,
        ...values
      })
    ).then(() => {
      close();
    });
  };

  const formik = useFormik({
    initialValues: {
      hideTabs: get(preferences, 'hideTabs', false),
      font: {
        codeFont: get(preferences, 'font.codeFont', 'default')
      },
      theme: storedTheme
    },
    validationSchema: interfacePrefsSchema,
    onSubmit: handleSave
  });

  return (
    <StyledWrapper>
      <ThemeSelects
        value={formik.values.theme}
        onChange={(newTheme) => {
          formik.setFieldValue('theme', newTheme);
        }}
      />

      <div className="flex items-center mb-4">
        <input
          id="hideTabsSetting"
          className="mousetrap mr-0"
          type="checkbox"
          name="hideTabs"
          checked={formik.values.hideTabs}
          onChange={() => {
            formik.setFieldValue('hideTabs', !formik.values.hideTabs);
          }}
        />
        <label className="flex items-center ml-2 select-none" htmlFor="hideTabsSetting">
          Hide tabs
        </label>
      </div>

      <label className="block font-medium">Code Editor Font</label>
      <input
        type="text"
        className="block textbox mt-2 w-full"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        name="font.codeFont"
        value={formik.values.font.codeFont}
        onChange={formik.handleChange}
      />

      <div className="mt-10">
        <button type="submit" className="submit btn btn-sm btn-secondary" onClick={formik.handleSubmit}>
          Save
        </button>
      </div>
    </StyledWrapper>
  );
};

export default Interface;
