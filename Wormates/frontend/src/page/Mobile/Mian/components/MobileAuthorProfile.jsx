import React, {useState, useEffect, useHistory, useCallback, useRef, useLayoutEffect,createContext, useContext} from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet, useNavigate, NavLink, useParams,useLocation, Switch, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import apiUrl from '../../../../apiUrl.jsx';
import { jwtDecode } from 'jwt-decode';
import { useSwipeable } from 'react-swipeable';
import { motion } from 'framer-motion';
import ProfileLibrary from './ProfileLibrary.jsx';


function MobileAuthorProfile() {
    const [profileData, setProfileData] = useState('');
    const [library, setLibrary] = useState(false);
    const { username } = useParams();

    useEffect(() => {
        const fetchProfile = async () => {
          try {
            const response = await axios.get(`${apiUrl}/users/api/${username}/`, {

            });
            setProfileData(response.data);
          } catch (err) {

            console.error(err);
          } finally {

          }
        };
    
        fetchProfile();
      }, []);
      if (!profileData) {
        // Можно добавить индикатор загрузки, пока данные не загружены
        return <div>Loading...</div>;
    }
    const libraryOpen = () => {
      setLibrary(!library);
    }
    return(
        <div>
            <img className='mobile_profile__banner' src={profileData.banner_image} alt="" />
            <div className='mobile_profile__info'>
                <img className='mobile_profile__avatar' src={profileData.profileimg} alt="" />
                <div>
                    <div className='mobile_profile_name'>{profileData.user.first_name} {profileData.user.last_name}</div>
                    <div className='mobile__profile_count_cont'>
                        <div className='mobile__profile_username'>@{profileData.user.username}</div>
                        <div className='mobile__profile_coun_foll'>
                            <div className='mobile__profile_foll'>{profileData.following_count} Followings</div>
                            <div className='mobile__profile_foll'>{profileData.followers_count} Followers</div>
                        </div>
                        <div>
                            <div className='mobile__profile_books'>{profileData.books_count} Books</div>
                            <div className='mobile__profile_books'>{profileData.series_count} Series</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='mobile_profile_about_cont'>
                <div className='mobile_profile_about_view'>About</div>
                <div className='mobile_profile_about_text'>{profileData.about}</div>
            </div>
            <div>
                <button className='mobile_profile_menu_buttons' onClick={libraryOpen}>
                    <div>Library</div>
                    <div className={`button_toggle ${library ? 'open' : ''}`}></div>
                </button>
                <div className={`mobile_profile_library ${library ? 'open' : ''}`}>
                  <ProfileLibrary/>
                </div>
            </div>
        </div>
    )
}

export default MobileAuthorProfile;