import { SpinnerInfinity } from 'spinners-react';

export default function Loading() {
    return (
        <div className="loading-panel">
            <SpinnerInfinity
                size={150}
                сolor='#38ad48'
                secondaryColor='rgba(0,0,0,0.44)'
            />
        </div>
    )
}