import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { ThemeProvider, createTheme } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircleProgress from "@mui/material/CircularProgress";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { pink, teal } from "@mui/material/colors";
import axios from "axios";
import { useRouter } from "next/dist/client/router";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useSetRecoilState } from "recoil";
import { globalLoadingState, sessionState } from "../modules/atoms";
import { AuthResponseData, generateSessionData } from "../modules/jwt";

const publicTheme = createTheme({
  palette: {
    primary: { main: teal[500] },
    secondary: { main: pink["A200"] },
  },
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const setSession = useSetRecoilState(sessionState);
  const setGlobalLoading = useSetRecoilState(globalLoadingState);
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      setGlobalLoading(true);
      const url = `${process.env.NEXT_PUBLIC_API_HOST || ""}/api/refresh_token`;
      axios
        .request<AuthResponseData>({
          url,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        })
        .then((response) => {
          enqueueSnackbar("ログイン中です", { variant: "success" });
          const sessionData = generateSessionData(response.data);
          setSession(sessionData);
          setGlobalLoading(false);
          router.replace("/");
        })
        .catch((err) => {
          localStorage.removeItem("jwt");
          setSession(null);
          setGlobalLoading(false);
        });
    }
  }, [router, enqueueSnackbar, setSession, setLoading, setGlobalLoading]);

  const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEmail(e.currentTarget.value);

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPassword(e.currentTarget.value);

  const handleSubmit = () => {
    setLoading(true);
    const url = `${process.env.NEXT_PUBLIC_API_HOST || ""}/api/login`;
    axios
      .request<AuthResponseData>({
        url,
        method: "POST",
        data: { email, password },
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        setLoading(false);
        localStorage.setItem("jwt", response.data.token);
        const sessionData = generateSessionData(response.data);
        setSession(sessionData);
        enqueueSnackbar("ログインしました", { variant: "success" });
        router.replace("/");
      })
      .catch(() => {
        setLoading(false);
        enqueueSnackbar("メールアドレスまたはパスワードが一致しません", {
          variant: "error",
        });
      });
  };

  return (
    <ThemeProvider theme={publicTheme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: "url(https://source.unsplash.com/random)",
            backgroundRepeat: "no-repeat",
            backgroundColor: (t) =>
              t.palette.mode === "light"
                ? t.palette.grey[50]
                : t.palette.grey[900],
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Box component="div" sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="メールアドレス"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={handleEmail}
                onKeyPress={(e) => {
                  if (e.key == "Enter") handleSubmit();
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="パスワード"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={handlePassword}
                onKeyPress={(e) => {
                  if (e.key == "Enter") handleSubmit();
                }}
              />
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading && <CircleProgress size={20} />}
              >
                サインイン
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
