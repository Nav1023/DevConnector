import axios from 'axios';
import { setAlert } from './alert';
import {
    PROFILE_ERROR,
    GET_PROFILE,
    UPDATE_PROFILE,
    CLEAR_PROFILE,
    ACCOUNT_DELETED,
    GET_PROFILES,
    GET_REPOS
} from './types';

//Get current user profile 

export const getCurrentProfile = () => async dispatch =>{
    try {
        const  res  = await axios.get('http://localhost:5000/api/profile/me');
        dispatch({
            type: GET_PROFILE,
            payload: res.data
        });
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status}
        });
    }
};

//Get all profiles
export const getProfiles = () => async dispatch =>{

    dispatch({ type: CLEAR_PROFILE });

    try {
        const  res  = await axios.get('http://localhost:5000/api/profile');
        dispatch({
            type: GET_PROFILES,
            payload: res.data
        });
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status}
        });
    }
};

//Get profile by id
export const getProfileById = userId => async dispatch =>{
    try {
        const  res  = await axios.get(`http://localhost:5000/api/profile/user/${userId}`);
        dispatch({
            type: GET_PROFILE ,
            payload: res.data
        });
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status}
        });
    }
};

//Get github repos
export const getGithubRepos= username => async dispatch =>{
    try {
        const  res  = await axios.get(`http://localhost:5000/api/profile/github/${username}`);
        dispatch({
            type: GET_REPOS ,
            payload: res.data
        });
    } catch (err) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status}
        });
    }
};

//Create or update profile 
export const createProfile = (formData, history, edit = false) => async dispatch => {

    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        const res = await axios.post('http://localhost:5000/api/profile', formData, config);

        dispatch({
            type: GET_PROFILE,
            dispatch: res.data
        });

        dispatch(setAlert( edit ? 'Profile Updated': 'Profile Created', 'success'));

        if(!edit){
            history.push('/dashboard');
        }

    } catch (err) {
        dispatch(setAlert(err.response.data.message, 'danger'))
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status}
        });
    }

};

//Add Experience 
export const addExperience = (formData, history) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        const res = await axios.put('http://localhost:5000/api/profile/experience', formData, config);

        dispatch({
            type: UPDATE_PROFILE,
            dispatch: res.data
        });

        dispatch(setAlert( 'Experience added', 'success'));

        history.push('/dashboard');

    } catch (err) {

        dispatch(setAlert(err.response.data.message, 'danger'))
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status}
        });
    }
}
//Add Education 
export const addEducation = (formData, history) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        const res = await axios.put('http://localhost:5000/api/profile/education', formData, config);

        dispatch({
            type: UPDATE_PROFILE,
            dispatch: res.data
        });

        dispatch(setAlert( 'Education added', 'success'));

        history.push('/dashboard');

    } catch (err) {
        dispatch(setAlert(err.response.data.message, 'danger'))
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status}
        });
    }
}

//Delete Experience 
export const deleteExperience = id => async dispatch => {
    try {
        const res = await axios.delete(`http://localhost:5000/api/profile/experience/${id}`);

        console.log(res);
        dispatch({
            type: UPDATE_PROFILE,
            dispatch: res.data
        });
        dispatch(setAlert( 'Experience Removed', 'success'));
    } catch (err) {
        dispatch(setAlert(err.response.data.message, 'danger'))
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.message}
        });
    }
}


//Delete Education 
export const deleteEducation = id => async dispatch => {
    try {
        const res = await axios.delete(`http://localhost:5000/api/profile/education/${id}`);

        console.log(res)
        dispatch({
            type: UPDATE_PROFILE,
            dispatch: res.data
        });
        dispatch(setAlert( 'Education Removed', 'success'));
    } catch (err) {
        dispatch(setAlert(err.response.data.message, 'danger'))
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status}
        });
    }
}

//Delete account & profile 
export const deleteAccount = id => async dispatch => {
    if(window.confirm('Are you sure? This can NOT be undone')){
        try {
            // const res = await axios.delete(`http://localhost:5000/api/profile/`);
    
            dispatch({
                type: CLEAR_PROFILE
            });
            dispatch({
                type: ACCOUNT_DELETED
            });
            dispatch(setAlert( 'Your account has been permanantly deleted'));
        } catch (err) {
            dispatch({
                type: PROFILE_ERROR,
                payload: { msg: err.response.statusText, status: err.response.status}
            });
        }
    }
}