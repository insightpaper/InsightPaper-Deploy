"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#7244eb" },
    secondary: { main: "#7244eb" },
    error: { main: "#c62828" },
  },

  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          color: "white",
        },
      },
    },
    //INPUTS
    MuiIconButton: {
      defaultProps: {
        size: "small",
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          "& .MuiSwitch-switchBase": {
            "&.Mui-checked": {
              color: "white",
              "& + .MuiSwitch-track": {
                opacity: 1,
                backgroundColor: "#7244eb",
              },
            },
          },
          "& .MuiSwitch-track": {
            backgroundColor: "white",
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: "white", // Default border color
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#7244eb",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&:not(.Mui-disabled):hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#7244eb",
          },
          "&.Mui-error:hover .MuiOutlinedInput-notchedOutline, &.Mui-error:focus .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "red", // Prevent hover/focus color change in error state
            },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
      styleOverrides: {
        root: {
          "& input:-webkit-autofill": {
            boxShadow: "0 0 0px 1000px #222222 inset !important",
            WebkitTextFillColor: "#b6a7ed !important",
          },
          "& input:-webkit-autofill:hover": {
            boxShadow: "0 0 0px 1000px #222222 inset !important",
            WebkitTextFillColor: "#b6a7ed !important",
          },
          "& input:-webkit-autofill:focus": {
            boxShadow: "0 0 0px 1000px #222222 inset !important",
            WebkitTextFillColor: "#b6a7ed !important",
          },
          "& input, & textarea": {
            color: "white",
          },

          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "white",
          },
          '& input[type="date"]::-webkit-calendar-picker-indicator': {
            filter: "invert(1)",
          },
          '& input[type="time"]::-webkit-calendar-picker-indicator': {
            filter: "invert(1)",
          },
          '& input[type="number"]': {
            MozAppearance: "textfield",
            WebkitAppearance: "none",
            appearance: "textfield",
            margin: 0,
          },
          '& input[type="number"]::-webkit-inner-spin-button': {
            WebkitAppearance: "none",
            margin: 0,
          },
          '& input[type="number"]::-webkit-outer-spin-button': {
            WebkitAppearance: "none",
            margin: 0,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: "#b6a7ed", // Set your desired helper text color here
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "white", // Label color
          "&.Mui-focused": {
            color: "#7244eb", // Label color when focused
          },
          "&.Mui-error": {
            color: "red", // Label color in error state
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          color: "white", // Default text color for labels
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        size: "small",
      },
      styleOverrides: {
        root: {
          color: "white", // Default text color for selected value
          "& .MuiSvgIcon-root": {
            color: "white", // Dropdown arrow color
          },
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            // backgroundColor: "#633ac8", // Background color for selected item
            color: "white", // Text color for selected item
          },
          "&.Mui-selected:hover": {
            backgroundColor: "rgba(114, 68, 235, 1)", // Darker background on hover
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        inputRoot: {
          "& .MuiFilledInput-root": {
            textAlign: "center",
            paddingTop: "10px",
            paddingBottom: "10px",
            display: "flex",
            alignItems: "center",
          },
          "& .MuiFilledInput-input": {
            paddingTop: "10px",
            paddingBottom: "10px",
            display: "flex",
            alignItems: "center",
          },
        },
        tag: {
          color: "white",
          "&.MuiChip-root": {
            backgroundColor: "#7244eb", // Background color for chips inside Autocomplete
            color: "#fff", // Text color for chips
            "& .MuiChip-deleteIcon": {
              color: "#fff", // Delete icon color
            },
          },
        },
        popupIndicator: {
          color: "white", // Set ArrowDropDownIcon to white
        },
        clearIndicator: {
          color: "white", // Set ArrowDropDownIcon to white
        },
      },
    },
    //TABLES
    MuiTableCell: {
      defaultProps: {
        padding: "none",
      },
      styleOverrides: {
        root: {
          fontSize: "0.75rem",
          padding: 9,
          color: "white", // Set text color for all table cells
        },
        head: {
          paddingLeft: 32,
          paddingRight: 32,
          color: "white", // Text color for header cells
          backgroundColor: "black", // Background color for header cells
          fontWeight: "bold",
        },
        body: {
          paddingLeft: 32,
          paddingRight: 32,
          color: "white", // Ensure body cells also have white text
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#888",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#555",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1",
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          "&:before": {
            display: "none",
          },
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          border: "1px solid #404040", // Set border color to #404040
          borderRadius: "2px", // Optional: Add border radius
        },
      },
    },
    MuiSkeleton: {
      defaultProps: {
        animation: "wave",
      },
    },
  },
});

export default theme;
