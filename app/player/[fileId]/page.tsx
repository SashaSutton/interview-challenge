
import { Player } from '../../components/Player';

export default function PlayerPage({ params }: { params: { fileId: string } }) {
    return <Player fileId={params.fileId} />;
}