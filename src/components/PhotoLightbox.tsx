import { type FC, useEffect, useState } from "react";
import PhotoLightboxContent, { type PhotoLightboxProps } from "./PhotoLightboxContent";

const PhotoLightbox: FC<PhotoLightboxProps> = (props) => {
	const [everOpened, setEverOpened] = useState(false);

	useEffect(() => {
		if (props.open) {
			setEverOpened(true);
		}
	}, [props.open]);

	const shouldMount = props.open || everOpened;
	if (!shouldMount) {
		return null;
	}

	return <PhotoLightboxContent {...props} />;
};

export default PhotoLightbox;
export type { PhotoLightboxProps } from "./PhotoLightboxContent";
