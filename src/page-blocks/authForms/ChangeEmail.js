import axios from "axios";
import { useRouter } from "next/router";
import React, { useRef, useReducer, useState, useEffect } from "react";
import { Typography, Stack, Button } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import { blurInputField } from "../../utility-functions/general/blurInputField";
import FormHelperText from "@mui/material/FormHelperText";
import AuthHeader from "./HeaderHelper";
import { getSession } from "next-auth/react";
import GeneralErrorModal from "../../custom-components/Modals/GeneralError";
import { styles } from "../../../styles/auth/manageAccount";
import ReturnHomeBtn from "../../custom-components/ReturnHomeBtn";
import AbsoluteCenter from "../../custom-components/LoadingVisuals/AbsoluteCenter";

function reducer(state, action) {
  switch (action.type) {
    // Actions to take when the user submits a bad input for a field
    case "INVALID_NEW_EMAIL":
      return { ...state, emailText: action.payload, emailError: true };
    case "INVALID_PASSWORD":
      return { ...state, passwordText: action.payload, passwordError: true }; // prettier-ignore
    case "TYPING_NEW_EMAIL":
        return { ...state, emailText: " ", emailError: false }; // prettier-ignore
    case "TYPING_PASSWORD":
      return { ...state, passwordText: " ", passwordError: false }; // prettier-ignore
    case "RESET":
      return {
        emailText: " ",
        emailError: false,
        passwordText: " ",
        passwordError: false,
      };
    default:
      return state;
  }
}

// Since this component is nested within /auth/[panel].js
// We'll let that component take care of redirects if we're on this page while offline (no SSR guards here)

export default function ChangeEmail(props) {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false); // visibility of general error modal
  // State values that reveal/hide loading visuals + preserve user inputs
  const [loading, setLoading] = useState({
    inProgress: false,
    // Prevents the inputs from being cleared after a re-render
    emailInput: "",
    passwordInput: "",
  });
  // This f() sets the loading state to true so we can trigger a loading visual + preserves user inputs
  const loadingInProgress = (emailInput, passwordInput) => {
    setLoading({ inProgress: true, emailInput, passwordInput });
  };
  // This f() sets the loading state value to false which ends the loading animation
  const loadingConcluded = () => {
    setLoading((prevState) => ({ ...prevState, inProgress: false }));
  };

  // These states and dispatch functions control the error text and colors of each input field
  const [formState, dispatch] = useReducer(reducer, {
    emailText: " ", // allots space for the message before we even want one to be visible
    emailError: false,
    passwordText: " ",
    passwordError: false,
  });

  // Collect values of what's typed in each of the input fields
  const newEmailRef = useRef();
  const passwordRef = useRef();

  const changeEmailHandler = async function () {
    const typedNewEmail = newEmailRef.current.value;
    const typedPassword = passwordRef.current.value;
    dispatch({ type: "RESET" }); // reset form state
    loadingInProgress(typedNewEmail, typedPassword);
    try {
      await axios.post("/api/auth/swapEmailP1", {
        newEmail: typedNewEmail,
        submittedPassword: typedPassword,
      });
      localStorage.setItem("emailChangePending", true);
      router.push(`/auth/manage-account/verify-email-change`);
      loadingConcluded();
    } catch (error) {
      // Render error messages onscreen depending on the response object recieved
      const errorMSG = error?.response?.data?.message;
      switch (errorMSG) {
        case "New email field is required":
          dispatch({ type: "INVALID_NEW_EMAIL", payload: "This field is required" }); // prettier-ignore
          break;
        case "Password field is required":
          dispatch({ type: "INVALID_PASSWORD", payload: "This field is required" }); // prettier-ignore
          break;
        case "User offline":
          router.push("/auth/signin");
          break;
        case "This email's already tied to your Local Eats account":
        case "Invalid email entry":
          dispatch({ type: "INVALID_NEW_EMAIL", payload: errorMSG });
          break;
        case "This email is connected to an existing Local Eats account":
          dispatch({ type: "INVALID_NEW_EMAIL", payload: errorMSG });
          break;
        case "Account password incorrect":
          dispatch({ type: "INVALID_PASSWORD", payload: errorMSG });
          break;
        default: // reveal error modal
          setModalVisible(true);
          break;
      }
      loadingConcluded();
    }
  };

  // Grab the email we're logged in with on startup to use in JSX
  const [currentEmail, setCurrentEmail] = useState("");
  useEffect(async () => {
    const session = await getSession();
    setCurrentEmail(session.user.email);
  }, []);

  if (loading.inProgress) return <AbsoluteCenter />;
  return (
    <Stack sx={styles.parentContainer}>
      <AuthHeader titleText={"Change Email"} descriptionText={""} />

      <FormControl sx={styles.formControl}>
        <Typography align="left" variant="label" sx={{ mb: 2, mt: "2px" }}>
          CURRENT EMAIL:
          <br />
          <Typography>{currentEmail}</Typography>
        </Typography>

        <Typography
          align="left"
          variant="label"
          color={formState.emailError ? "secondary" : ""}
        >
          New Email:
        </Typography>
        <OutlinedInput
          inputRef={newEmailRef}
          placeholder="Enter new email"
          error={formState.emailError}
          onChange={() => dispatch({ type: "TYPING_NEW_EMAIL" })}
          defaultValue={loading.emailInput}
          inputProps={blurInputField}
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
          Current Account Password:
        </Typography>
        <OutlinedInput
          inputRef={passwordRef}
          placeholder="Enter password"
          type="password"
          error={formState.passwordError}
          onChange={() => dispatch({ type: "TYPING_PASSWORD" })}
          defaultValue={loading.passwordInput}
          inputProps={blurInputField}
        />
        <FormHelperText sx={styles.formHelperText}>
          {formState.passwordText}
        </FormHelperText>
      </FormControl>

      <Button
        variant="contained"
        disableElevation
        onClick={changeEmailHandler}
        sx={{ width: "80%", maxWidth: "20.625rem" }}
      >
        Change account email
      </Button>
      <ReturnHomeBtn />
      <GeneralErrorModal modalVisible={modalVisible} />
    </Stack>
  );
}
