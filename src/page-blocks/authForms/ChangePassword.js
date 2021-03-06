import React, { useRef, useState, useReducer } from "react";
import axios from "axios";
import { Typography, Stack, Button, Box } from "@mui/material"; // prettier-ignore
import { signOut } from "next-auth/react";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import { blurInputField } from "../../utility-functions/general/blurInputField";
import AuthHeader from "./HeaderHelper";
import FormHelperText from "@mui/material/FormHelperText";
import GeneralErrorModal from "../../custom-components/Modals/GeneralError";
import { styles } from "../../../styles/auth/manageAccount";
import { mix } from "../../../styles/styleMixins";
import Tooltip from "@mui/material/Tooltip";
import HelpIcon from "@mui/icons-material/Help";
import ReturnHomeBtn from "../../custom-components/ReturnHomeBtn";
import AbsoluteCenter from "../../custom-components/LoadingVisuals/AbsoluteCenter";

// Since this component is nested within /auth/[panel].js
// We'll let that component take care of redirects if we're on this page while offline
export default function ChangePassword() {
  const [modalVisible, setModalVisible] = useState(false); // visibility of the generic error modal
  // State values that reveal/hide loading visuals + preserve user inputs
  const [loading, setLoading] = useState({
    inProgress: false,
    // Prevents the inputs from being cleared after a re-render
    oldPasswordInput: "",
    newPasswordInput: "",
    verifyPasswordInput: "",
  });
  // This f() sets the loading state to true so we can trigger a loading visual + preserves user inputs
  // prettier-ignore
  const loadingInProgress = (oldPasswordInput, newPasswordInput, verifyPasswordInput) => {
    setLoading({ inProgress: true, oldPasswordInput, newPasswordInput, verifyPasswordInput }); 
  };
  // This f() sets the loading state value to false which ends the loading animation
  const loadingConcluded = () => {
    setLoading((prevState) => ({ ...prevState, inProgress: false }));
  };

  // These states and dispatch functions control the error text and colors of each input field
  const [formState, dispatch] = useReducer(reducer, {
    oldPasswordText: " ", // allots space for the message before we even want one to be visible
    oldPasswordError: false,
    newPasswordText: " ",
    newPasswordError: false,
    verifyPasswordText: " ",
    verifyPasswordError: false,
  });
  const oldPasswordHandler = () => dispatch({ type: "TYPING_OLD_PASSWORD" }); // prettier-ignore
  const newPasswordHandler = () => dispatch({ type: "TYPING_NEW_PASSWORD" }); // prettier-ignore
  const verifyPasswordHandler = () => dispatch({ type: "TYPING_VERIFY_PASSWORD" }); // prettier-ignore

  // Collect values typed into each input field
  const oldPasswordRef = useRef();
  const newPasswordRef = useRef();
  const verifyPasswordRef = useRef();

  const changePasswordHandler = async function () {
    // dispatch({ type: "RESET" });
    // Capture values of input fields
    const typedOldPassword = oldPasswordRef.current.value;
    const typedNewPassword = newPasswordRef.current.value;
    const typedVerifyPassword = verifyPasswordRef.current.value;
    loadingInProgress(typedOldPassword, typedNewPassword, typedVerifyPassword);

    // Verify the passwords typed in the input fields
    try {
      await axios.post("/api/auth/checkPasswordFields", {
        oldPassword: typedOldPassword,
        newPassword1: typedNewPassword,
        newPassword2: typedVerifyPassword,
      });
      signOut(); // log out so the user can sign back in using new credentials
      loadingConcluded(); // end the loading animation
      // IMPORTANT: sign out and prompt users to relogin to reinitialize NextAuth with up to date user data
      // Our SSR page guard will take care of the redirect for us to /auth/siginPostPasswordChange
    } catch (error) {
      const errorMSG = error?.response?.data?.message;
      switch (errorMSG) {
        case "New password field empty":
          dispatch({ type: "INVALID_NEW_PASSWORD", payload: "This field is required" }); // prettier-ignore
          break;
        case "Verify password field empty":
          dispatch({ type: "INVALID_VERIFY_PASSWORD", payload: "This field is required" }); // prettier-ignore
          break;
        case "Old password field empty":
          dispatch({ type: "INVALID_OLD_PASSWORD", payload: "This field is required" }); // prettier-ignore
          break;
        case "New password must be different":
          dispatch({ type: "INVALID_NEW_PASSWORD", payload: errorMSG }); // prettier-ignore
          break;
        case "newPassword2 !== newPassword1":
          dispatch({ type: "INVALID_VERIFY_PASSWORD", payload: "This password must match the previous one" }); // prettier-ignore
          break;
        case "Password does not meet requirements":
          dispatch({ type: "INVALID_NEW_PASSWORD", payload: errorMSG }); // prettier-ignore
          break;
        case "Old password incorrect":
          dispatch({ type: "INVALID_OLD_PASSWORD", payload: "Incorrect account password" }); // prettier-ignore
          break;
        default: // reveals the error modal
          setModalVisible();
          break;
      }
      loadingConcluded(); // end the loading animation
    }
  };

  if (loading.inProgress) return <AbsoluteCenter />;
  return (
    <Stack sx={styles.parentContainer}>
      <AuthHeader titleText={"Change Password"} descriptionText={""} />
      <FormControl sx={styles.formControl}>
        <Typography
          align="left"
          variant="label"
          color={formState.oldPasswordError ? "secondary" : ""}
        >
          Old Password:
        </Typography>
        <OutlinedInput
          inputRef={oldPasswordRef}
          placeholder="Enter old password"
          error={formState.oldPasswordError}
          onChange={oldPasswordHandler}
          defaultValue={loading.oldPasswordInput}
          inputProps={blurInputField}
        />
        <FormHelperText sx={styles.formHelperText}>
          {formState.oldPasswordText}
        </FormHelperText>
      </FormControl>
      <FormControl sx={styles.formControl}>
        <Box sx={{ ...mix.flexRow }}>
          <Typography
            align="left"
            variant="label"
            color={formState.newPasswordError ? "secondary" : ""}
          >
            New Password:
          </Typography>
          <Tooltip
            title="8 characters or longer. Requires an uppercase, lowercase, plus
          at least 1 symbol. No punctuation"
            placement="top"
            enterTouchDelay={0}
            leaveTouchDelay={3500}
          >
            <HelpIcon fontSize="small" sx={{ ml: 1, fontSize: "16px" }} />
          </Tooltip>
        </Box>
        <OutlinedInput
          inputRef={newPasswordRef}
          placeholder="Enter new password"
          error={formState.newPasswordError}
          onChange={newPasswordHandler}
          defaultValue={loading.newPasswordInput}
          inputProps={blurInputField}
        />
        <FormHelperText sx={styles.formHelperText}>
          {formState.newPasswordText}
        </FormHelperText>
      </FormControl>
      <FormControl sx={styles.formControl}>
        <Typography
          align="left"
          variant="label"
          color={formState.verifyPasswordError ? "secondary" : ""}
        >
          Verify New Password:
        </Typography>
        <OutlinedInput
          inputRef={verifyPasswordRef}
          placeholder="Enter new password again"
          error={formState.verifyPasswordError}
          onChange={verifyPasswordHandler}
          type="password"
          defaultValue={loading.verifyPasswordInput}
          inputProps={blurInputField}
        />
        <FormHelperText sx={styles.formHelperText}>
          {formState.verifyPasswordText}
        </FormHelperText>
      </FormControl>

      <Button
        variant="contained"
        disableElevation
        onClick={changePasswordHandler}
        sx={{ width: "80%", maxWidth: "20.625rem" }}
      >
        Change password
      </Button>
      <ReturnHomeBtn />
      <GeneralErrorModal modalVisible={modalVisible} />
    </Stack>
  );
}

function reducer(state, action) {
  switch (action.type) {
    // Actions to take when the user submits a bad input for a field
    case "INVALID_OLD_PASSWORD":
      return { ...state, oldPasswordText: action.payload, oldPasswordError: true }; // prettier-ignore
    case "INVALID_NEW_PASSWORD":
      return { ...state, newPasswordText: action.payload, newPasswordError: true }; // prettier-ignore
    case "INVALID_VERIFY_PASSWORD":
      return { ...state, verifyPasswordText: action.payload, verifyPasswordError: true }; // prettier-ignore
    // When typing in our input fields, remove error text and messages
    case "TYPING_OLD_PASSWORD":
      return { ...state, oldPasswordText: " ", oldPasswordError: false };
    case "TYPING_NEW_PASSWORD":
      return { ...state, newPasswordText: " ", newPasswordError: false };
    case "TYPING_VERIFY_PASSWORD":
      return { ...state, verifyPasswordText: " ", verifyPasswordError: false };
    case "RESET":
      return {
        oldPasswordText: " ",
        oldPasswordError: false,
        newPasswordText: " ",
        newPasswordError: false,
        verifyPasswordText: " ",
        verifyPasswordError: false,
      };
    default:
      return state;
  }
}
