import { useEffect, useState } from 'react';
import { Container, Grid, Box } from '@mui/material';
import './login-page.css';
import loginBg from '../../../assets/img/login-bg.jpg';
import loginBg2 from '../../../assets/img/login-bg2.jpg';
import loginBg3 from '../../../assets/img/login-bg3.jpg';
import logo from '../../../assets/img/logo.png';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const LoginContainer = ({ children }: any) => {
  const navigate = useNavigate();

  const [openDialog, setOpenDialog] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const dispatch = useDispatch();

  const [activeImage, setActiveImage] = useState(0);
  const images = [loginBg2, loginBg, loginBg3];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((prevActive) => (prevActive + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Container maxWidth="md" sx={{ maxWidth: '100% !important', padding: '0 !important' }}>
      <Grid container justifyContent="center" alignItems="center">
        <Grid item xs={12} sm={6} className="left">
          <div className="image-carousel">
            <div className="image-scroll-container" style={{ transform: `translateX(-${activeImage * 100}%)` }}>
              {images.map((img, index) => (
                <img key={index} src={img} alt={`Image ${index + 1}`} className="image" />
              ))}
            </div>
            <div className="image-indicators">
              {images.map((_, index) => (
                <span key={index} className={`indicator ${index === activeImage ? 'active' : ''}`} />
              ))}
            </div>
          </div>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Grid container justifyContent="center" alignItems="center">
            <Grid item xs={12} sm={7}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <img src={logo} alt="logo" />
              </Box>
              {children}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginContainer;
