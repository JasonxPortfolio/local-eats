import React, { useRef, useState, useReducer } from "react";
import { Typography, Box, Stack, Button, TextField, InputLabel } from "@mui/material"; // prettier-ignore
import { useRouter } from "next/router";
import FormControl, { useFormControl } from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import {
  breakAfter,
  breakBefore,
} from "../../src/custom-components/ConditionalBreak";
import FormHelperText from "@mui/material/FormHelperText";
import { mix } from "../../styles/styleMixins";
import { credentialSignIn } from "../api/helperFunctions/credentialSignIn";
import { getSession } from "next-auth/react";
import AuthHeader from "../../src/page-blocks/authForms/HeaderHelper";

// Redirect users to homepage if they come here online
export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req }); // falsy if not logged in. session obj if we are
  if (session) {
    return {
      redirect: {
        destination: "/", // redirect to this path
        permanent: false, // don't always want to redirect (only if user's logged in)
      },
    };
  }
  return { props: { session } };
}

export default function signup() {
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
          alert("Something's gone wrong on our end!"); //!!! replace with modal
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
        titleText={"Sign In"}
        descriptionText={"Sign in to gain access to bookmarks plus any new features upon release!"} // prettier-ignore
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
        sx={{ width: "80%", maxWidth: "20.625rem" }}
      >
        Log into account
      </Button>
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
};
