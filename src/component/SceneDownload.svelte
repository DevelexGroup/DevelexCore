<script lang="ts">
	import { db } from "../database/database";
	import dwellRepository from "../database/repositories/dwell.repository";
	import fixationRepository from "../database/repositories/fixation.repository";
	import intersectRepository from "../database/repositories/intersect.repository";
	import pointRepository from "../database/repositories/point.repository";
	import saccadeRepository from "../database/repositories/saccade.repository";
	import validationRepository from "../database/repositories/validation.repository";
	import Button from "./Button.svelte";
import GenericGroup from "./GenericGroup.svelte";

const saveCsvString = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "data.csv";
    a.click();
    URL.revokeObjectURL(url);
};

const downloadPoints = () => {
    pointRepository.getAll().then((points) => {
        const csv = pointRepository.csvHeader() + "\n" +
        points.map((point) => {
            console.log(point);
            return pointRepository.toCsv(point);
        }).join("\n");
        saveCsvString(csv, "gaze-points.csv");
    });
};

const downloadFixations = () => {
    fixationRepository.getAll().then((fixations) => {
        const csv = fixationRepository.csvHeader() + "\n" +
        fixations.map((fixation) => {
            return fixationRepository.toCsv(fixation);
        }).join("\n");
        saveCsvString(csv, "gaze-fixations.csv");
    });
};

const downloadSaccades = () => {
    saccadeRepository.getAll().then((saccades) => {
        const csv = saccadeRepository.csvHeader() + "\n" +
        saccades.map((saccade) => {
            return saccadeRepository.toCsv(saccade);
        }).join("\n");
        saveCsvString(csv, "gaze-saccades.csv");
    });
};

const downloadDwells = () => {
    dwellRepository.getAll().then((dwells) => {
        const csv = dwellRepository.csvHeader() + "\n" +
        dwells.map((dwell) => {
            return dwellRepository.toCsv(dwell);
        }).join("\n");
        saveCsvString(csv, "gaze-dwells.csv");
    });
};

const downloadValidations = () => {
    validationRepository.getAll().then((validations) => {
        const csv = validationRepository.csvHeader() + "\n" +
        validations.map((validation) => {
            return validationRepository.toCsv(validation);
        }).join("\n");
        saveCsvString(csv, "gaze-validations.csv");
    });
};

const downloadIntersects = () => {
    intersectRepository.getAll().then((intersects) => {
        const csv = intersectRepository.csvHeader() + "\n" +
        intersects.map((intersect) => {
            return intersectRepository.toCsv(intersect);
        }).join("\n");
        saveCsvString(csv, "gaze-intersects.csv");
    });
};

</script>

<div class="holder">
    <GenericGroup heading="Clear database">
        <p>
            This will clear all data from the database. This action cannot be undone.
        </p>
        <Button text={"Clear database"} on:click={() => {
            db.delete({disableAutoOpen: false});
        }} />
    </GenericGroup>
    <GenericGroup heading="Export data as CSV">
        <p>
            Caution, data is exported as a CSV file seperated by commas. If your Microsoft Excel is not set to use commas as seperator, like in Germany or Czechia by default, the data will not be displayed correctly.
        </p>
        <Button text={"Download gaze points"} on:click={downloadPoints} />
        <Button text={"Download intersects"} on:click={downloadIntersects} />
        <Button text={"Download fixations"} on:click={downloadFixations} />
        <Button text={"Download saccades"} on:click={downloadSaccades} />
        <Button text={"Download dwells"} on:click={downloadDwells} />
        <Button text={"Download validations"} on:click={downloadValidations} />
    </GenericGroup>
</div>

<style>
    .holder {
        display: grid;
        flex-wrap: wrap;
        justify-content: space-between;
        grid-template-columns: 1fr;
        gap: 2rem;
    }
    p {
        font-size: small;
        max-width: 600px;
    }
</style>