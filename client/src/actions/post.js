import axios from 'axios';
import { setAlert } from './alert';
import {
    GET_POSTS,
    POST_ERROR,
    UPDATE_LIKES
} from './types'

//GET POSTS 
export const getPosts = () => async dispatch => {
    try {
        const res = await axios.get('http://localhost:5000/api/posts');

        dispatch({
            type: GET_POSTS,
            payload: res.data
        })
    } catch (err) {
        dispatch({
            type: POST_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status}
        });
    }
}

//ADD LIKES
export const addLike = id => async dispatch => {
    try {
        const res = await axios.put(`http://localhost:5000/api/posts/like/${id}`);

        dispatch({
            type: UPDATE_LIKES,
            payload: {
                id,
                likes: res.data
            }
        });
    } catch (err) {
        dispatch({
            type: POST_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status}
        });
    }
}

//Remove LIKES
export const removeLike = id => async dispatch => {
    try {
        const res = await axios.put(`http://localhost:5000/api/posts/unlike/${id}`);
       
        dispatch({
            type: UPDATE_LIKES,
            payload: {
                id,
                likes: res.data
            }
        })
    } catch (err) {
        dispatch({
            type: POST_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status}
        });
    }
}