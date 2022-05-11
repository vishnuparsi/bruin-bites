import { Modal, Card, Container } from 'react-bootstrap';
import { Button } from 'react-bootstrap';

// TODO: add review form pop-up?
// import { useState } from 'react';

// import { Row, Col } from 'react-bootstrap';
// add css later
// TODO: make favorite places list components?

export default function VenueCard(props) {
	// const [show, setShow] = useState(false);
	// const handleClose = () => setShow(false);
	// const handleShow = () => setShow(true);

	const openUrl = (url) => {
		const win = window.open(url, "_blank");
		if (win != null) {
			win.focus();
		}
	}

	return (
		<Card style={{height: '30rem'}}>
			<Card.Img 
				style={{height: "40%", width: "auto"}} 
				variant="top" 
				src={props.image}
			/>
			<Card.Header className="fs-2 border-0">{props.name}</Card.Header>
			<Card.Body>
				<div className="d-grid gap-2 ">
					<Button 
						size="lg"
						> 
						Leave a Review 
					</Button>
					<Button 
						variant="secondary" 
						size="lg"
						onClick={() => openUrl(props.link)}
						> 
						Menu 
					</Button>
					<Button variant="secondary" size="lg"> I ate here! </Button>
				</div>
			</Card.Body>
		</Card>
	);
}