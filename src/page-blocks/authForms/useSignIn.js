import React, { useRef, useState, useReducer } from "react";
import { Typography, Box, Stack, Button, TextField, InputLabel } from "@mui/material"; // prettier-ignore
import { useRouter } from "next/router";
import FormControl, { useFormControl } from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormHelperText from "@mui/material/FormHelperText";
import { mix } from "../../../styles/styleMixins";
import { credentialSignIn } from "../../../pages/api/helperFunctions/credentialSignIn";
import AuthHeader from "../../../src/page-blocks/authForms/HeaderHelper";
import GeneralErrorModal from "../../../src/custom-components/Modals/GeneralError";
import GuestBtn from "../../custom-components/GuestBtn";
export default function useSignIn(title, descrip, needNewAccount) {
  const router = useRouter();
  // Collect values of what's typed in each of the input fields
  const emailRef = useRef();
  const passwordRef = useRef();

  // Control the text underneath the input fields using state values
  const [formState, dispatch] = useReducer(reducer, {
    emailText: " ", // allots space for the message before we even want one to be visible
    emailError: false,
    passwordText: " ",
    passwordError: false,
  });

  // Control the general error modal should open if one of our API route 3rd party services fail
  const [modalVisible, setModalVisible] = React.useState(false);
  const revealErrorModal = () => setModalVisible(true);

  const loginHandler = async function () {
    // Capture values of input fields
    const typedEmail = emailRef.current.value;
    const typedPassword = passwordRef.current.value;

    // If one of the input fields is empty, render some error text without looking in the DB
    const thinnedEmail = typedEmail.replaceAll(" ", "");
    const thinnedPassword = typedPassword.replaceAll(" ", "");
    if (thinnedEmail.length === 0)
      return dispatch({
        type: "INVALID_EMAIL",
        payload: "This field is required",
      });
    if (thinnedPassword.length === 0)
      return dispatch({
        type: "INVALID_PASSWORD",
        payload: "This field is required",
      });

    // Perform an email/password check on our DB by calling the FN defined in [...nextAuth].js
    const loginRequest = await credentialSignIn(typedEmail, typedPassword); // request object returned
    // request object on failure: {error: "Message explaining the problem", ok: true, status: 200 }
    // request object on success: {error: null, ...rest doesn't matter }

    // If the login attempt is not successful...
    if (loginRequest.error) {
      const errorMSG = loginRequest.error;
      // Render error messages on the form depending on the error type
      switch (errorMSG) {
        case "No account found using this email":
        case "The account tied to this email is not verified yet":
          dispatch({ type: "INVALID_EMAIL", payload: errorMSG });
          break;
        case "Incorrect password":
          dispatch({ type: "INVALID_PASSWORD", payload: errorMSG });
          break;
        default:
          revealErrorModal();
          // render general error modal if the failed response message is something other than the options we provided
          // should only happen when one of our 3rd party services fail (SendGrid, MongoDB...etc)
          break;
      }
      return;
    }
    // If the login attempt is successful, redirect to homepage
    if (!loginRequest.error) return router.push("/");
  };

  // The state values in useReducer influence the JSX based on their values
  return (
    <Stack sx={styles.parentContainer}>
      <AuthHeader
        titleText={title}
        descriptionText={descrip} // prettier-ignore
      />

      <FormControl sx={styles.formControl}>
        <Typography
          align="left"
          variant="label"
          color={formState.emailError ? "secondary" : ""}
        >
          User Email:
        </Typography>
        <OutlinedInput
          inputRef={emailRef}
          placeholder="name@email.com"
          error={formState.emailError}
          onChange={() => dispatch({ type: "RESET_EMAIL" })}
        />
        <FormHelperText sx={styles.formHelperText}>
          {formState.emailText}
        </FormHelperText>
      </FormControl>

      <FormControl sx={styles.formControl}>
        <Typography
          align="left"
          variant="label"
          color={formState.passwordError ? "secondary" : ""}
        >
          Password:
        </Typography>
        <OutlinedInput
          inputRef={passwordRef}
          placeholder="Enter password"
          error={formState.passwordError}
          onChange={() => dispatch({ type: "RESET_PASSWORD" })}
        />
        <FormHelperText sx={styles.formHelperText}>
          {formState.passwordText}
        </FormHelperText>
      </FormControl>

      <Button
        variant="contained"
        onClick={loginHandler}
        sx={styles.btn}
        disableElevation
      >
        Sign in to Local Eats
      </Button>
      {needNewAccount && (
        <Button
          variant="outlined"
          href="/auth/signup"
          sx={{ ...styles.btn, mt: 2 }}
        >
          Need an account? Sign up!
        </Button>
      )}
      <GuestBtn />
      <GeneralErrorModal modalVisible={modalVisible} />
    </Stack>
  );
}

function reducer(state, action) {
  switch (action.type) {
    case "INVALID_EMAIL":
      return {
        emailText: action.payload,
        emailError: true,
        passwordText: " ", // Reset other states back to init value
        passwordError: false,
      };
    case "INVALID_PASSWORD":
      return {
        passwordText: action.payload,
        passwordError: true,
        emailText: " ", // Reset other states back to init value
        emailError: false,
      };
    case "RESET_EMAIL":
      return {
        ...state,
        emailText: " ",
        emailError: false,
      };
    case "RESET_PASSWORD":
      return {
        ...state,
        passwordText: " ",
        passwordError: false,
      };
    case "RESET":
      return {
        emailText: " ",
        emailError: false,
        passwordText: " ",
        passwordError: false,
      };
    default:
      return;
  }
}

const styles = {
  parentContainer: {
    width: "100%",
    height: "78vh",
    maxWidth: "35rem",
    margin: "auto",
    textAlign: "center",
    // border: "5px solid black",
    ...mix.flexColumn,
    justifyContent: "center",
  },
  formControl: {
    width: "80%",
    maxWidth: "20.625rem",
    mb: 0.75,
    fontWeight: 500,
  },
  formHelperText: {
    color: "#d32f2f",
    m: 0,
    mt: 0.5,
  },
  btn: {
    width: "80%",
    maxWidth: "20.625rem",
  },
};