import { DataList } from "./data-list";
import { DataForm } from "./data-form";
import { Utils } from "../core/utils";
import { IFieldProps } from "@organic-ui";
import { Field } from "./field";
import { Card, CardActionArea, CardActions, CardContent, CardMedia, Button, Typography } from '../controls/card';
import { getFieldValue } from "../reinvent/binding-source";
export class DataGallery extends DataList {
    props: OrganicUi.IDataGalleryProps;
    checkedIds: any = {};
    static isDataList = true;
    nodes: any[];
    mapping: any;
    constructor(p: OrganicUi.IDataGalleryProps) {
        super(p);
        if (!p.fieldMapping) {
            ['key', 'title', 'media', 'description']
                .forEach(roleName => {
                    if (!this.childrenByRole[roleName])
                        throw 'DataGallery require children with  role=description'
                });

        }

    }
    getSelectedKeyCollection() {
        return this.props.selection.selectedNodeKeys;
    }
    handleGetCheckBoxStatus(targetNode) {
        return this.props.selection.selectedNodeKeys[targetNode[this.mapping.key]] ? 1 : 0;
    }

    renderCard(cardValues) {
        return <Card >
            <CardActionArea>
                <CardMedia
                    image="/static/images/cards/contemplative-reptile.jpg"
                    title="Contemplative Reptile"
                />
                <CardContent>
                    <Typography gutterBottom variant="headline" component="h2">
                        Lizard
</Typography>
                    <Typography component="p">
                        Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging
                        across all continents except Antarctica
</Typography>
                </CardContent>
            </CardActionArea>
            <CardActions>
                <Button size="small" color="primary">
                    Share
</Button>
                <Button size="small" color="primary">
                    Learn More
</Button>
            </CardActions>
        </Card>

    }

    renderDataForm(data) {

        return <DataForm {...{ data, onCustomRenderWithCaptureValues: this.renderCard }}>
            {this.props.children}
        </DataForm>
    }
    renderCardByMapping(item): JSX.Element {
        const { fieldMapping } = this.props;
        const cardValues = Object.keys(fieldMapping)
            .reduce((accum, key) => Object.assign(accum, { [key]: getFieldValue(item, fieldMapping[key]) }), {});
        return this.renderCard(cardValues);
    }
    renderItems(items: any[]) {
        const { fieldMapping } = this.props;
        const cards = items.map(
            !!fieldMapping ?
                this.renderCardByMapping.bind(this) :
                this.renderDataForm.bind(this));
        return <div className="data-gallery">{cards}</div>
    }



}
interface ICardValues {
    key: string;
    title: string;
    media: string;
    description: string;
}