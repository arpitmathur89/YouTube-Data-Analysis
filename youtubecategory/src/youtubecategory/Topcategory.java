package youtubecategory;
import java.io.IOException;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.TextInputFormat;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.fs.Path;

public class Topcategory {
	public static class Map extends Mapper<LongWritable,Text,Text,IntWritable>{
		private Text category = new Text();
		private final static IntWritable occurance = new IntWritable(1);
		public void map(LongWritable key, Text value,
				Context context) throws IOException,InterruptedException {
			
			String record = value.toString();
			String str[] = record.split(",");
			if(str.length>5){
				category.set(str[3]);
			}
			context.write(category, occurance);
		}
	}
	
	public static class Reduce extends Reducer<Text,IntWritable,Text,IntWritable>{

		public void reduce(Text key, Iterable<IntWritable> values,
				Context context) throws IOException,InterruptedException {
			int totaloccurance = 0;

			for(IntWritable value: values)
			{
				totaloccurance+=value.get();
			}
			context.write(key, new IntWritable(totaloccurance));
			
		}
		
	}

	@SuppressWarnings("deprecation")
	public static void main(String[] args) throws IOException, ClassNotFoundException, InterruptedException {
	
		Configuration conf1= new Configuration();
		

		Job job = new Job(conf1,"myyoutube");
		
		job.setJarByClass(Topcategory.class);
		job.setMapperClass(Map.class);
		job.setReducerClass(Reduce.class);
		
		job.setOutputKeyClass(Text.class);
		job.setOutputValueClass(IntWritable.class);
		
		job.setInputFormatClass(TextInputFormat.class);
		job.setOutputFormatClass(TextOutputFormat.class);
	        
	    FileInputFormat.addInputPath(job, new Path(args[0]));
	    FileOutputFormat.setOutputPath(job, new Path(args[1]));
			
		System.exit(job.waitForCompletion(true) ? 0 : 1);
	}
}
